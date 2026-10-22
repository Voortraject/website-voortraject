// Pure omzetting van Google-reviews naar rijen voor `google_reviews`. Staat los van
// index.ts zodat vitest hem rechtstreeks kan importeren.
//
// Twee bronnen leveren dezelfde review in een andere vorm aan: de oudere Place
// Details-API (die op "nieuwste" kan sorteren) en de Places API (New) (alleen op
// relevantie). Beide moeten dezelfde `google_review_id` opleveren, anders staat één
// review na een terugval twee keer in de tabel. Google staat één review per account
// per plek toe, dus het contributor-nummer uit de profiel-URL is de gedeelde sleutel.

export type ReviewRij = {
  google_review_id: string;
  author_name: string;
  profile_photo_url: string | null;
  rating: number;
  text: string | null;
  relative_time: string | null;
  publish_time: string | null;
  language: string | null;
};

/** Haalt het contributor-nummer uit `https://www.google.com/maps/contrib/<nr>/reviews`. */
export function contributorVan(url: string | undefined): string | null {
  return url?.match(/\/contrib\/(\d+)/)?.[1] ?? null;
}

// Oudere Place Details-API (maps.googleapis.com/maps/api/place/details/json).
export type LegacyReview = {
  author_name?: string;
  author_url?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number; // unix-seconden
  language?: string;
};

export function rijUitLegacy(placeId: string, r: LegacyReview): ReviewRij {
  const naam = r.author_name ?? "Google-gebruiker";
  const contrib = contributorVan(r.author_url);
  return {
    google_review_id: contrib ? `${placeId}:${contrib}` : `${placeId}:${naam}:${r.time ?? ""}`,
    author_name: naam,
    profile_photo_url: r.profile_photo_url ?? null,
    rating: r.rating ?? 0,
    text: r.text?.trim() || null,
    relative_time: r.relative_time_description ?? null,
    publish_time: r.time ? new Date(r.time * 1000).toISOString() : null,
    language: r.language ?? null,
  };
}

// Places API (New) (places.googleapis.com/v1/places/<id>).
export type NieuweReview = {
  name?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
};

export function rijUitNieuw(placeId: string, r: NieuweReview): ReviewRij {
  const naam = r.authorAttribution?.displayName ?? "Google-gebruiker";
  const contrib = contributorVan(r.authorAttribution?.uri);
  return {
    google_review_id: contrib ? `${placeId}:${contrib}` : (r.name ?? `${placeId}:${naam}`),
    author_name: naam,
    profile_photo_url: r.authorAttribution?.photoUri ?? null,
    rating: r.rating ?? 0,
    text: r.text?.text ?? r.originalText?.text ?? null,
    relative_time: r.relativePublishTimeDescription ?? null,
    publish_time: r.publishTime ?? null,
    language: r.text?.languageCode ?? null,
  };
}
