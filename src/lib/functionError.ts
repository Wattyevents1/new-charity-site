import type { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase `functions.invoke` returns a generic
 * "Edge Function returned a non-2xx status code" message regardless of what
 * the function actually responded with. The real payload lives on
 * `error.context` (a `Response` object). This helper reads it and returns
 * the backend's error string when available.
 */
export const extractFunctionError = async (
  error: unknown,
  fallback = "Request failed. Please try again.",
): Promise<string> => {
  const err = error as (FunctionsHttpError & { context?: Response; message?: string }) | null;
  try {
    const ctx = err?.context as Response | undefined;
    if (ctx && typeof ctx.clone === "function") {
      const cloned = ctx.clone();
      const text = await cloned.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          const msg = parsed?.error ?? parsed?.message;
          if (msg) return typeof msg === "string" ? msg : JSON.stringify(msg);
        } catch {
          return text;
        }
      }
    }
  } catch {
    // ignore — fall through to message/fallback
  }
  return err?.message || fallback;
};

/**
 * Wrapper around `supabase.functions.invoke` that throws an Error containing
 * the actual backend message instead of the generic non-2xx string. Also
 * surfaces `{ error }` returned in a 2xx body as a thrown error.
 */
export async function invokeFunction<T = unknown>(
  name: string,
  options?: Parameters<typeof supabase.functions.invoke>[1],
  fallback?: string,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, options);
  if (error) {
    const msg = await extractFunctionError(error, fallback);
    throw new Error(msg);
  }
  if (data && typeof data === "object" && "error" in data && (data as { error?: unknown }).error) {
    const e = (data as { error: unknown }).error;
    throw new Error(typeof e === "string" ? e : JSON.stringify(e));
  }
  return data as T;
}
