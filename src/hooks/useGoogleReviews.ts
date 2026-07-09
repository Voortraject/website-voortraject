import { useEffect, useState } from "react";

import { supabaseExternal } from "@/integrations/supabase/external-client";

export type GoogleReview = {
  id: string;
  author_name: string;
  profile_photo_url: string | null;
  rating: number;
  text: string | null;
  relative_time: string | null;
};

export type GooglePlaceStats = {
  rating: number | null;
  user_rating_count: number | null;
};

type UseGoogleReviews = {
  reviews: GoogleReview[] | null; // null = nog niet geladen of niet beschikbaar → component valt terug
  stats: GooglePlaceStats | null;
};

// Leest de gesynchroniseerde Google-reviews uit het CRM-Supabaseproject
// (`supabaseExternal`) — hetzelfde project waar de website ook leads naartoe
// schrijft. Faalt de query (tabel bestaat nog niet, netwerkfout, geen rijen),
// dan blijft `reviews` null en toont het component zijn hardcoded fallback. Zo
// kan de sectie nooit breken.
export function useGoogleReviews(): UseGoogleReviews {
  const [reviews, setReviews] = useState<GoogleReview[] | null>(null);
  const [stats, setStats] = useState<GooglePlaceStats | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const [reviewsRes, statsRes] = await Promise.all([
        supabaseExternal
          .from("google_reviews")
          .select("id, author_name, profile_photo_url, rating, text, relative_time")
          .gte("rating", 4)
          .order("publish_time", { ascending: false })
          .limit(6),
        supabaseExternal
          .from("google_place_stats")
          .select("rating, user_rating_count")
          .eq("id", 1)
          .maybeSingle(),
      ]);

      if (!active) return;

      const rows = reviewsRes.data as GoogleReview[] | null;
      if (!reviewsRes.error && rows && rows.length > 0) {
        setReviews(rows);
      }

      const statRow = statsRes.data as GooglePlaceStats | null;
      if (!statsRes.error && statRow) {
        setStats(statRow);
      }
    })().catch(() => {
      /* stil falen → fallback in het component */
    });

    return () => {
      active = false;
    };
  }, []);

  return { reviews, stats };
}
