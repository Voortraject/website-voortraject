import { Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { herkomstZoekstring } from "@/lib/herkomst";

import { metAdres, type CheckAdres } from "./checkStaat";

// De uitweg op stap 1 van de check: wie de check niet wil invullen, laat via
// het contactformulier zijn nummer achter. Bedoeld voor bezoekers uit een
// Meta-advertentie; de video ("Liever gebeld worden? Dat kan daar ook") en de
// advertentietekst ("Tik op de knop en laat je nummer achter") wijzen hiernaar.
//
// Rustig gehouden: een omlijnde knop naast de oker knop van stap 1, nooit een
// tweede oker knop. De check blijft de hoofdroute.
//
// Wat er meegaat naar /contact:
//  - de herkomst (utm-tags en fbclid) in de querystring (herkomstZoekstring),
//    zodat het contactformulier ze bij de lead kan wegschrijven;
//  - het adres, als het al getypt was (adresVoorContact in checkStaat.ts), in de
//    history-state en nooit in de URL: de Meta-pixel stuurt de volledige URL mee.
export const LieverBellen = ({ adres }: { adres: CheckAdres | null }) => {
  const { search } = useLocation();
  return (
    <Link
      to={{ pathname: "/contact", search: herkomstZoekstring(search) }}
      state={{ ...metAdres(adres), bellen: true }}
      aria-label="Liever gebeld worden? Laat je nummer achter"
      className="inline-flex min-h-[58px] w-[58px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-primary/20 bg-card text-[14.5px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-[400px]:w-auto min-[400px]:px-4 sm:px-5"
    >
      <Phone size={18} strokeWidth={2.3} className="shrink-0" aria-hidden="true" />
      {/* Op de smalste telefoons past zelfs "Bel mij" niet naast "Zoek mijn
          subsidies": dan alleen het telefoonicoon (de aria-label draagt de zin). */}
      <span className="hidden min-[400px]:inline">Bel mij</span>
    </Link>
  );
};

export default LieverBellen;
