// Supabase Edge Function: sync-google-reviews
//
// Haalt de nieuwste reviews van ons Google-profiel op (Place Details met
// `reviews_sort=newest`, terugval: Places API (New)), filtert op >= 4 sterren,
// en schrijft ze naar de tabellen `google_reviews` en `google_place_stats`.
// Bedoeld om dagelijks via een cron te draaien. De site kiest daaruit zelf wat
// hij toont (src/lib/reviews.ts: nieuwste eerst, minstens 10 woorden).
//
// De API-key blijft server-side (secret) — hij komt nooit in de browserbundle.
//
// Benodigde secrets (Supabase → Project Settings → Edge Functions → Secrets):
//   GOOGLE_MAPS_API_KEY  — key met Places API (New) ingeschakeld, en liefst ook
//                          Places API (de oudere), want alleen die sorteert op nieuwste
//   GOOGLE_PLACE_ID      — Place ID van Voortraject
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
  rijUitLegacy,
  rijUitNieuw,
} from "./reviewrij.ts";

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

// De 5 nieuwste reviews, of de reden waarom deze API (nu) niet bruikbaar is.
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

// Terugval: Places API (New), 5 reviews op relevantie. De FieldMask beperkt payload
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

Deno.serve(async (req: Request) => {
  // Vóór alles anders: zonder geldig geheim geen aanroep bij Google.
  const verwacht = Deno.env.get("REVIEWS_SYNC_SECRET");
  if (!verwacht) return json({ error: "De sync is niet ingesteld op de server." }, 500);
  if (req.headers.get("x-poller-secret") !== verwacht) {
    return json({ error: "Geen toegang." }, 401);
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const placeId = Deno.env.get("GOOGLE_PLACE_ID");
    if (!apiKey || !placeId) {
      return json(
        { error: "Ontbrekende secret GOOGLE_MAPS_API_KEY of GOOGLE_PLACE_ID" },
        500,
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Google geeft per aanroep hooguit 5 reviews. De Places API (New) kiest die op
    // "relevantie" en kent geen sortering, waardoor een verse review dagen of
    // nooit binnenkwam. De oudere Place Details-API kan wél `reviews_sort=newest`,
    // dus die proberen we eerst. Weigert hij (staat niet aan op de key, of Google
    // zet hem uit), dan valt de sync terug op de Places API (New), zoals voorheen.
    let opgehaald = await haalNieuwste(apiKey, placeId);
    const nieuwsteEerst = !("onbruikbaar" in opgehaald);
    if ("onbruikbaar" in opgehaald) {
      console.warn("Place Details (nieuwste) niet bruikbaar:", opgehaald.onbruikbaar);
      await waarschuw(
        "nieuwe reviews kunnen gemist worden",
        "De sync kon de nieuwste Google-reviews niet ophalen en viel terug op de 5 die " +
          "Google 'relevant' vindt. Zolang dat zo is, kan een nieuwe review de site missen.\n\n" +
          `Reden van Google: ${opgehaald.onbruikbaar}\n\n` +
          "Meestal staat de oudere 'Places API' niet (meer) aan voor de key in Google Cloud " +
          "(project My First Project), of heeft Google hem uitgezet.",
      );
      opgehaald = await haalRelevantste(apiKey, placeId);
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
    const rows = opgehaald.reviews
      .filter((r) => r.rating >= MIN_RATING)
      .map((r) => ({ ...r, synced_at: runAt }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from("google_reviews")
        .upsert(rows, { onConflict: "google_review_id" });
      if (upsertError) throw upsertError;
    }

    // Opruimen. Reviews stapelen zich op: de 5 van vandaag duwen die van gisteren
    // niet meer van de site. Alleen binnen het venster dat Google ons net liet zien
    // (alles vanaf de oudste van deze 5) betekent "ontbreekt" ook echt "verdwenen bij
    // Google, of onder de 4 sterren gezakt". Daarbuiten weten we het niet, dus laten
    // we het staan. Bij de terugval (relevantie) is er geen venster: dan niets weg.
    if (nieuwsteEerst && opgehaald.reviews.length > 0) {
      const oudste = opgehaald.reviews
        .map((r) => r.publish_time)
        .filter((t): t is string => t !== null)
        .sort()[0];
      if (oudste) {
        const { error: pruneError } = await supabase
          .from("google_reviews")
          .delete()
          .lt("synced_at", runAt)
          .gte("publish_time", oudste);
        if (pruneError) throw pruneError;
      }
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
      bron: nieuwsteEerst ? "nieuwste" : "relevantie",
      rating: opgehaald.rating,
      total: opgehaald.totaal,
    });
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    await waarschuw("mislukt", `De sync liep vast bij het opslaan in de database.\n\n${melding}`);
    return json({ error: melding }, 500);
  }
});
