declare const Deno: { env: { get(name: string): string | undefined } };
export interface VerificationResult { success?: boolean; action?: string; hostname?: string }
export const FRONTEND_HOSTNAMES = new Set([
  "al-imran-muslim-aid.lovable.app",
  "id-preview--7c9417b1-cfe1-4fed-810a-cb8ec70f15b5.lovable.app",
]);

export function validVerification(result: VerificationResult, action: string, hosts: Set<string>) {
  return result.success === true && result.action === action && typeof result.hostname === "string" && hosts.has(result.hostname);
}

export async function verifyTurnstile(token: unknown, action: string): Promise<boolean> {
  if (typeof token !== "string" || !token.trim() || token.length > 2048) return false;
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (!secret) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!response.ok) return false;
    return validVerification(await response.json(), action, FRONTEND_HOSTNAMES);
  } catch { return false; }
}