import { createContext, useContext, useState, ReactNode } from "react";

export type Audience = "uitvoerders" | "bewoners";

interface AudienceContextValue {
  audience: Audience;
  setAudience: (a: Audience) => void;
}

const AudienceContext = createContext<AudienceContextValue | undefined>(undefined);

export const AudienceProvider = ({ children }: { children: ReactNode }) => {
  const [audience, setAudience] = useState<Audience>("uitvoerders");
  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </AudienceContext.Provider>
  );
};

export const useAudience = () => {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudience must be used within AudienceProvider");
  return ctx;
};
