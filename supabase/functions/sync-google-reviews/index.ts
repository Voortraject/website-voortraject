// Supabase Edge Function: sync-google-reviews
//
// Haalt de reviews van ons Google-profiel op via de Places API (New),
// filtert op >= 4 sterren, en schrijft ze naar de tabellen `google_reviews`
// en `google_place_stats`. Bedoeld om dagelijks via een cron te draaien.
//
// De API-key blijft server-side (secret) — hij komt nooit in de browserbundle.
//
// Benodigde secrets (Supabase → Project Settings → Edge Functions → Secrets):
//   GOOGLE_MAPS_API_KEY  — key met Places API (New) ingeschakeld
//   GOOGLE_PLACE_ID      — Place ID van Voortraject
// SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY worden automatisch geïnjecteerd.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";
const MIN_RATING = 4;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async () => {
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

    // Places API (New) — Place Details. De FieldMask beperkt payload én kosten:
    // we vragen alleen wat we tonen. languageCode=nl → Nederlandse reviewtekst
    // waar beschikbaar.
    const res = await fetch(`${PLACES_ENDPOINT}/${placeId}?languageCode=nl`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
      },
    });

    if (!res.ok) {
      return json(
        { error: "Places API-fout", status: res.status, body: await res.text() },
        502,
      );
    }

    const place = await res.json();
    const runAt = new Date().toISOString();

    // Filter op >= 4 sterren: lage reviews bereiken de site nooit.
    type PlaceReview = {
      name?: string;
      rating?: number;
      text?: { text?: string; languageCode?: string };
      originalText?: { text?: string };
      authorAttribution?: { displayName?: string; photoUri?: string };
      relativePublishTimeDescription?: string;
      publishTime?: string;
    };

    const rows = ((place.reviews ?? []) as PlaceReview[])
      .filter((r) => (r.rating ?? 0) >= MIN_RATING)
      .map((r) => ({
        google_review_id: r.name ?? `${placeId}:${r.authorAttribution?.displayName}`,
        author_name: r.authorAttribution?.displayName ?? "Google-gebruiker",
        profile_photo_url: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? MIN_RATING,
        text: r.text?.text ?? r.originalText?.text ?? null,
        relative_time: r.relativePublishTimeDescription ?? null,
        publish_time: r.publishTime ?? null,
        language: r.text?.languageCode ?? null,
        synced_at: runAt,
      }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from("google_reviews")
        .upsert(rows, { onConflict: "google_review_id" });
      if (upsertError) throw upsertError;
    }

    // Prune: reviews die deze run niet ververst zijn (oude synced_at) zijn niet
    // meer relevant/verdwenen bij Google, of zakten onder 4 sterren → verwijderen.
    const { error: pruneError } = await supabase
      .from("google_reviews")
      .delete()
      .lt("synced_at", runAt);
    if (pruneError) throw pruneError;

    // Aggregatie voor de kop.
    const { error: statsError } = await supabase
      .from("google_place_stats")
      .upsert({
        id: 1,
        rating: place.rating ?? null,
        user_rating_count: place.userRatingCount ?? null,
        synced_at: runAt,
      });
    if (statsError) throw statsError;

    return json({
      synced: rows.length,
      rating: place.rating ?? null,
      total: place.userRatingCount ?? null,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
