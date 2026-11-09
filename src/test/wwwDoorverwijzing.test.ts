import { describe, expect, it, vi } from "vitest";

import { onRequest } from "../../functions/_middleware.js";

const verzoek = (url: string, method = "GET") => {
  const next = vi.fn(async () => new Response("doorgelaten"));
  return { context: { request: new Request(url, { method }), next }, next };
};

describe("doorverwijzing van www naar het hoofddomein", () => {
  it("stuurt www permanent door met behoud van pad en query", async () => {
    const { context, next } = verzoek("https://www.voortraject.nl/contact?utm_source=x");
    const antwoord = await onRequest(context);

    expect(antwoord.status).toBe(301);
    expect(antwoord.headers.get("location")).toBe("https://voortraject.nl/contact?utm_source=x");
    expect(next).not.toHaveBeenCalled();
  });

  it("laat het hoofddomein ongemoeid", async () => {
    const { context, next } = verzoek("https://voortraject.nl/contact");
    await onRequest(context);
    expect(next).toHaveBeenCalledOnce();
  });

  it("laat previewadressen ongemoeid", async () => {
    const { context, next } = verzoek("https://abc123.website-voortraject.pages.dev/");
    await onRequest(context);
    expect(next).toHaveBeenCalledOnce();
  });

  it("stuurt een POST niet door, want die zou zijn inhoud verliezen", async () => {
    const { context, next } = verzoek("https://www.voortraject.nl/contact", "POST");
    await onRequest(context);
    expect(next).toHaveBeenCalledOnce();
  });
});
