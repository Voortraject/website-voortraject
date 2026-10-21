import { useSyncExternalStore } from "react";

// Kiest tussen de indeling voor de telefoon en die voor een breed scherm (vanaf
// Tailwinds `lg`, 1024px). Niet met verborgen dubbele blokken: dan staan knoppen
// twee keer in de DOM en tekent het 3D-model twee keer. Zonder matchMedia (of in
// tests) geldt de telefoon: daar invullen de meeste bewoners.
const QUERY = "(min-width: 1024px)";

const lees = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;

const abonneer = (melding: () => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.("change", melding);
  return () => mq.removeEventListener?.("change", melding);
};

export function useBreed(): boolean {
  return useSyncExternalStore(abonneer, lees, () => false);
}
