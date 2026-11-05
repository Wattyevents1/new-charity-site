import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const SITE_KEY = "0x4AAAAAAF1Yaqoi4evFGMub";
interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
}
declare global { interface Window { turnstile?: TurnstileApi } }
let scriptPromise: Promise<void> | undefined;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); scriptPromise = undefined; reject(new Error("Verification could not load.")); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function Widget({ action, onToken, resetKey }: { action: string; onToken: (token: string) => void; resetKey: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let widgetId: string | undefined;
    onToken("");
    setError("");
    loadScript().then(() => {
      if (cancelled || !container.current || !window.turnstile) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: SITE_KEY, action, size: "flexible", theme: "auto",
        callback: (token: string) => { setError(""); onToken(token); },
        "expired-callback": () => { onToken(""); if (widgetId) window.turnstile?.reset(widgetId); },
        "error-callback": () => { onToken(""); setError("Verification failed. Please retry."); },
        "timeout-callback": () => { onToken(""); setError("Verification timed out. Please retry."); },
      });
    }).catch(() => { if (!cancelled) setError("Verification could not load. Please retry."); });
    return () => { cancelled = true; if (widgetId) window.turnstile?.remove(widgetId); onToken(""); };
  }, [action, onToken, resetKey, retry]);
  return <div className="w-full min-h-16 my-3" aria-label="Security verification">
    <div ref={container} />
    {error && <div className="flex items-center gap-2"><p role="alert" className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" size="icon" aria-label="Retry security verification" onClick={() => setRetry(value => value + 1)}><RotateCcw className="h-4 w-4" /></Button></div>}
  </div>;
}

export function useTurnstile(action: string) {
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const reset = useCallback(() => { setToken(""); setResetKey(value => value + 1); }, []);
  return { token, reset, widget: <Widget action={action} onToken={setToken} resetKey={resetKey} /> };
}