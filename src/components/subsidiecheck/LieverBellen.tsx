import { Link, useLocation } from "react-router-dom";

import { herkomstZoekstring } from "@/lib/herkomst";

import { metAdres, type CheckAdres } from "./checkStaat";

// De uitweg op stap 1 van de check: wie de check niet wil invullen, laat via
// het contactformulier zijn nummer achter. Bedoeld voor bezoekers uit een
// Meta-advertentie; de video en de advertentietekst noemen dezelfde zin, dus die
// moet hier letterlijk staan ("Liever even bellen? Laat je nummer achter").
//
// Rustig gehouden: één regel tekst onder de beloftes, geen knop. De check blijft
// de hoofdroute.
//
// Wat er meegaat naar /contact:
//  - de herkomst (utm-tags en fbclid) in de querystring (herkomstZoekstring),
//    zodat het contactformulier ze bij de lead kan wegschrijven;
//  - het adres, als het al getypt was (adresVoorContact in checkStaat.ts), in de
//    history-state en nooit in de URL: de Meta-pixel stuurt de volledige URL mee.
export const LieverBellen = ({ adres }: { adres: CheckAdres | null }) => {
  const { search } = useLocation();
  return (
    <p className="text-center text-[14px] leading-relaxed text-instap-zacht">
      Liever even bellen?{" "}
      <Link
        to={{ pathname: "/contact", search: herkomstZoekstring(search) }}
        state={metAdres(adres)}
        className="whitespace-nowrap rounded-sm font-bold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Laat je nummer achter
      </Link>
    </p>
  );
};

export default LieverBellen;
