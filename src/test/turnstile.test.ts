import { afterEach, describe, expect, it, vi } from "vitest";
import { FRONTEND_HOSTNAMES, validVerification, verifyTurnstile } from "../../supabase/functions/_shared/turnstile";

afterEach(() => vi.unstubAllGlobals());

describe("Turnstile submission verification", () => {
  const result = { success: true, action: "submit_contact", hostname: "al-imran-muslim-aid.lovable.app" };
  it("accepts the expected action on the published website", () => {
    expect(validVerification(result, "submit_contact", FRONTEND_HOSTNAMES)).toBe(true);
  });
  it("accepts the project preview hostname", () => {
    expect(validVerification({ ...result, hostname: "id-preview--7c9417b1-cfe1-4fed-810a-cb8ec70f15b5.lovable.app" }, "submit_contact", FRONTEND_HOSTNAMES)).toBe(true);
  });
  it("rejects tokens issued for another submission", () => {
    expect(validVerification(result, "donation_pesapal", FRONTEND_HOSTNAMES)).toBe(false);
  });
  it("rejects failed verification", () => {
    expect(validVerification({ ...result, success: false }, "submit_contact", FRONTEND_HOSTNAMES)).toBe(false);
  });
  it.each(["localhost", "127.0.0.1", "untrusted.example"])("rejects hostname %s on the production backend", hostname => {
    expect(validVerification({ ...result, hostname }, "submit_contact", FRONTEND_HOSTNAMES)).toBe(false);
  });
  it.each([undefined, "", " ", 123, "a".repeat(2049)])("rejects invalid token without calling Cloudflare", async token => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(await verifyTurnstile(token, "submit_contact")).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("fails closed when the secret is missing", async () => {
    vi.stubGlobal("Deno", { env: { get: () => undefined } });
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(await verifyTurnstile("fresh-token", "submit_contact")).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("verifies once per request and rejects Cloudflare replay responses", async () => {
    vi.stubGlobal("AbortSignal", { timeout: () => new AbortController().signal });
    vi.stubGlobal("Deno", { env: { get: () => "test-secret" } });
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(result)))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] })));
    vi.stubGlobal("fetch", fetcher);
    expect(await verifyTurnstile("fresh-token", "submit_contact")).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(await verifyTurnstile("fresh-token", "submit_contact")).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("fails closed on a Cloudflare network failure", async () => {
    vi.stubGlobal("Deno", { env: { get: () => "test-secret" } });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unavailable")));
    expect(await verifyTurnstile("fresh-token", "submit_contact")).toBe(false);
  });
});