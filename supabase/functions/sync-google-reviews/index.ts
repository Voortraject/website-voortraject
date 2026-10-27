// Supabase Edge Function: sync-google-reviews
//
// Haalt de reviews van ons Google-profiel op, filtert op >= 4 sterren, en schrijft ze
// naar de tabellen `google_reviews` en `google_place_stats`. Bedoeld om dagelijks via
// een cron te draaien. De site kiest daaruit zelf wat hij toont (src/lib/reviews.ts:
// nieuwste eerst, minstens 10 woorden).
//
// Hoofdbron: de Business Profile API (v4). Die geeft álle reviews met exacte datums,
// dus de tabel wordt elke run een exacte kopie van het profiel. Terugval, als die API
// niet bruikbaar is: Place Details met `reviews_sort=newest`, daarna Places API (New).
// Die geven hooguit 5 reviews, dus dan wordt er alleen aangevuld, nooit opgeruimd.
//
// Benodigde secrets (Supabase → Project Settings → Edge Functions → Secrets):
//   GOOGLE_OAUTH_CLIENT_ID      — OAuth-client "reviews-sync" in Google Cloud-project
//   GOOGLE_OAUTH_CLIENT_SECRET    My First Project (type Internal, scope business.manage)
//   GOOGLE_OAUTH_REFRESH_TOKEN  — van het account dat het bedrijfsprofiel beheert
//   GOOGLE_MAPS_API_KEY  — voor de terugval: key met Places API (New), en liefst ook
//                          Places API (de oudere), want alleen die sorteert op nieuwste
//   GOOGLE_PLACE_ID      — Place ID van Voortraject (terugval)
//   REVIEWS_SYNC_SECRET  — gedeeld geheim; de cron stuurt het mee in `x-poller-secret`
// Voor de waarschuwingsmail gebruikt hij dezelfde secrets als subsidiecheck-mail:
//   RESEND_API_KEY, MAIL_FROM en MAIL_TEAM (valt terug op MAIL_BCC, dan info@).
// SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY worden automatisch geïnjecteerd.
//
// Waarom het geheim: deze function staat open (verify_jwt = false, want pg_cron heeft geen
// gebruiker om een JWT van te lenen). Zonder slot kan iedereen die de URL kent hem aanroepen.
// Kosten levert dat niet op (Google Cloud heeft een daglimiet van 10 Place Details-verzoeken),
// maar wie de limiet opmaakt, blokkeert de echte sync voor die dag. De cron-taak met het
// geheim staat in de CRM-repo; schemawijzigingen gaan alleen daarvandaan.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  type LegacyReview,
  type NieuweReview,
  type ReviewRij,
  type V4Review,
  rijUitLegacy,
  rijUitNieuw,
  rijUitV4,
} from "./reviewrij.ts";

// Niet geheim: het Business Profile-account en de vestiging van Voortraject.
const BP_LOCATIE = "accounts/101593773793580087245/locations/17905714585642957796";
const BP_REVIEWS_ENDPOINT = `https://mybusiness.googleapis.com/v4/${BP_LOCATIE}/reviews`;
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";
const DETAILS_ENDPOINT = "https://maps.googleapis.com/maps/api/place/details/json";
const MIN_RATING = 4;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

type Opgehaald =
  | { reviews: ReviewRij[]; rating: number | null; totaal: number | null }
  | { fout: Record<string, unknown> };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Mailt het team als de sync niet doet wat hij moet. Zonder deze mail merkt niemand
// het: de cron kijkt niet naar het antwoord en de site toont gewoon wat er staat. Een
// mislukte mail mag de sync zelf nooit breken.
async function waarschuw(onderwerp: string, tekst: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY ontbreekt, geen waarschuwing gemaild:", onderwerp);
    return;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("MAIL_FROM") ?? "Voortraject <noreply@voortraject.nl>",
        to: [Deno.env.get("MAIL_TEAM") || Deno.env.get("MAIL_BCC") || "info@voortraject.nl"],
        subject: `Reviews-sync: ${onderwerp}`,
        text: `${tekst}\n\nDeze mail komt van de edge function sync-google-reviews (CRM-project). ` +
          `Je krijgt hem elke ochtend opnieuw zolang het probleem er is.`,
      }),
    });
    if (!res.ok) console.error("Resend-fout", res.status, await res.text());
  } catch (err) {
    console.error("Waarschuwing mailen faalde:", err);
  }
}

// Alle reviews via de Business Profile API, of de reden waarom dat (nu) niet lukt.
// `compleet` is alleen waar als we evenveel reviews kregen als Google er telt: pas
// dan mag de sync wat ontbreekt als "verdwenen" opruimen.
async function haalAlles(): Promise<
  (Opgehaald & { compleet: boolean }) | { onbruikbaar: string }
> {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    return { onbruikbaar: "secret GOOGLE_OAUTH_CLIENT_ID, _CLIENT_SECRET of _REFRESH_TOKEN ontbreekt" };
  }
  try {
    const tokenRes = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      return { onbruikbaar: `inloggen bij Google mislukt: HTTP ${tokenRes.status}, ${token.error ?? ""} ${token.error_description ?? ""}` };
    }

    const reviews: V4Review[] = [];
    let rating: number | null = null;
    let totaal: number | null = null;
    let pageToken: string | undefined;
    // Google geeft hooguit 50 per pagina; de grens van 20 pagina's vangt een lus af.
    for (let pagina = 0; pagina < 20; pagina++) {
      const url = new URL(BP_REVIEWS_ENDPOINT);
      url.searchParams.set("pageSize", "50");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token.access_token}` } });
      const body = await res.json();
      if (!res.ok) {
        return { onbruikbaar: `HTTP ${res.status}: ${body.error?.message ?? JSON.stringify(body)}` };
      }
      reviews.push(...((body.reviews ?? []) as V4Review[]));
      rating = body.averageRating ?? rating;
      totaal = body.totalReviewCount ?? totaal;
      pageToken = body.nextPageToken;
      if (!pageToken) break;
    }

    return {
      reviews: reviews.map(rijUitV4),
      // Google geeft 4.900000095367432; de kop toont één decimaal.
      rating: rating === null ? null : Math.round(rating * 10) / 10,
      totaal,
      compleet: !pageToken && totaal !== null && reviews.length >= totaal,
    };
  } catch (err) {
    return { onbruikbaar: err instanceof Error ? err.message : String(err) };
  }
}

// Terugval 1: de 5 nieuwste reviews, of de reden waarom deze API (nu) niet bruikbaar is.
async function haalNieuwste(
  apiKey: string,
  placeId: string,
): Promise<Opgehaald | { onbruikbaar: string }> {
  const url = new URL(DETAILS_ENDPOINT);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,reviews");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("language", "nl");
  url.searchParams.set("key", apiKey);
  try {
    const res = await fetch(url);
    const body = await res.json();
    if (!res.ok || body.status !== "OK") {
      return { onbruikbaar: `HTTP ${res.status}, ${body.status}: ${body.error_message ?? "geen toelichting"}` };
    }
    const result = body.result ?? {};
    return {
      reviews: ((result.reviews ?? []) as LegacyReview[]).map((r) => rijUitLegacy(placeId, r)),
      rating: result.rating ?? null,
      totaal: result.user_ratings_total ?? null,
    };
  } catch (err) {
    return { onbruikbaar: err instanceof Error ? err.message : String(err) };
  }
}

// Terugval 2: Places API (New), 5 reviews op relevantie. De FieldMask beperkt payload
// én kosten: we vragen alleen wat we tonen. languageCode=nl → Nederlandse reviewtekst
// waar beschikbaar.
async function haalRelevantste(apiKey: string, placeId: string): Promise<Opgehaald> {
  const res = await fetch(`${PLACES_ENDPOINT}/${placeId}?languageCode=nl`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
  });
  if (!res.ok) {
    return { fout: { error: "Places API-fout", status: res.status, body: await res.text() } };
  }
  const place = await res.json();
  return {
    reviews: ((place.reviews ?? []) as NieuweReview[]).map((r) => rijUitNieuw(placeId, r)),
    rating: place.rating ?? null,
    totaal: place.userRatingCount ?? null,
  };
}

// De terugvalroute, zoals de sync vóór de Business Profile API werkte: eerst de 5
// nieuwste, anders de 5 "relevantste".
async function haalViaPlaces(): Promise<Opgehaald & { bron?: string }> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  const placeId = Deno.env.get("GOOGLE_PLACE_ID");
  if (!apiKey || !placeId) {
    return { fout: { error: "Ontbrekende secret GOOGLE_MAPS_API_KEY of GOOGLE_PLACE_ID" } };
  }
  const nieuwste = await haalNieuwste(apiKey, placeId);
  if (!("onbruikbaar" in nieuwste)) return { ...nieuwste, bron: "nieuwste" };
  console.warn("Place Details (nieuwste) niet bruikbaar:", nieuwste.onbruikbaar);
  return { ...(await haalRelevantste(apiKey, placeId)), bron: "relevantie" };
}

Deno.serve(async (req: Request) => {
  // Vóór alles anders: zonder geldig geheim geen aanroep bij Google.
  const verwacht = Deno.env.get("REVIEWS_SYNC_SECRET");
  if (!verwacht) return json({ error: "De sync is niet ingesteld op de server." }, 500);
  if (req.headers.get("x-poller-secret") !== verwacht) {
    return json({ error: "Geen toegang." }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let bron = "business-profile";
    let compleet = false;
    let opgehaald: Opgehaald;
    const alles = await haalAlles();
    if ("onbruikbaar" in alles) {
      console.warn("Business Profile API niet bruikbaar:", alles.onbruikbaar);
      await waarschuw(
        "nieuwe reviews kunnen gemist worden",
        "De sync kon de reviews niet via de Business Profile API van Google ophalen en " +
          "viel terug op de oude route, die hooguit 5 reviews geeft. Zolang dat zo is, kan " +
          "een nieuwe review de site missen.\n\n" +
          `Reden van Google: ${alles.onbruikbaar}\n\n` +
          "Bij 'invalid_grant' is de koppeling met het Google-account ingetrokken of verlopen: " +
          "haal een nieuwe refresh token op (OAuth Playground, client reviews-sync in project " +
          "My First Project) en zet hem in secret GOOGLE_OAUTH_REFRESH_TOKEN.",
      );
      const places = await haalViaPlaces();
      opgehaald = places;
      bron = places.bron ?? bron;
    } else {
      opgehaald = alles;
      compleet = alles.compleet;
    }
    if ("fout" in opgehaald) {
      await waarschuw(
        "mislukt",
        `De sync kon helemaal geen reviews ophalen bij Google.\n\n${JSON.stringify(opgehaald.fout)}`,
      );
      return json(opgehaald.fout, 502);
    }

    const runAt = new Date().toISOString();

    // Filter op >= 4 sterren: lage reviews bereiken de site nooit.
    let rows = opgehaald.reviews
      .filter((r) => r.rating >= MIN_RATING)
      .map((r) => ({ ...r, synced_at: runAt }));

    // De terugval heeft een andere sleutel dan de Business Profile API. Een review die
    // er al staat, zou zo een tweede rij krijgen; daarom vult de terugval alleen
    // reviews aan van namen die nog niet in de tabel staan.
    if (bron !== "business-profile" && rows.length > 0) {
      const { data: bestaand, error: leesError } = await supabase
        .from("google_reviews")
        .select("author_name");
      if (leesError) throw leesError;
      const namen = new Set((bestaand ?? []).map((r) => r.author_name.trim().toLowerCase()));
      rows = rows.filter((r) => !namen.has(r.author_name.trim().toLowerCase()));
    }

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from("google_reviews")
        .upsert(rows, { onConflict: "google_review_id" });
      if (upsertError) throw upsertError;
    }

    // Opruimen. Alleen als de Business Profile API ons het hele profiel liet zien,
    // betekent "ontbreekt" ook echt "verdwenen bij Google, of onder de 4 sterren
    // gezakt". De terugval ziet er maar 5 en ruimt dus nooit op; de eerste geslaagde
    // run via de Business Profile API trekt de tabel weer recht.
    if (compleet) {
      const { error: pruneError } = await supabase
        .from("google_reviews")
        .delete()
        .lt("synced_at", runAt);
      if (pruneError) throw pruneError;
    } else if (bron === "business-profile") {
      console.warn("Business Profile API gaf minder reviews dan het totaal; niets opgeruimd.");
    }

    // Aggregatie voor de kop.
    const { error: statsError } = await supabase
      .from("google_place_stats")
      .upsert({
        id: 1,
        rating: opgehaald.rating,
        user_rating_count: opgehaald.totaal,
        synced_at: runAt,
      });
    if (statsError) throw statsError;

    return json({
      synced: rows.length,
      bron,
      opgeruimd: compleet,
      rating: opgehaald.rating,
      total: opgehaald.totaal,
    });
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    await waarschuw("mislukt", `De sync liep vast bij het opslaan in de database.\n\n${melding}`);
    return json({ error: melding }, 500);
  }
});
