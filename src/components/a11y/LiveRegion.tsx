import { useEffect, useState } from "react";

interface LiveRegionProps {
  /** Message announced to screen readers. Changing it re-announces. */
  message: string;
  /** "polite" waits for a pause, "assertive" interrupts. */
  politeness?: "polite" | "assertive";
  /** Use role="status" (default) or role="alert" for errors. */
  role?: "status" | "alert";
}

/**
 * Visually hidden ARIA live region for announcing dynamic updates
 * (payment status changes, receipt generation) to screen readers.
 */
const LiveRegion = ({ message, politeness = "polite", role = "status" }: LiveRegionProps) => {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    if (!message) {
      setAnnounced("");
      return;
    }
    // Clear first so identical consecutive messages are re-announced.
    setAnnounced("");
    const id = window.setTimeout(() => setAnnounced(message), 120);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announced}
    </div>
  );
};

export default LiveRegion;
