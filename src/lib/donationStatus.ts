export type DonationStatusCategory =
  | "successful"
  | "approved"
  | "pending"
  | "unsuccessful"
  | "refunded"
  | "unknown";

const SUCCESSFUL_STATUSES = ["completed", "complete", "success", "succeeded", "successful", "paid"];
const APPROVED_STATUSES = ["approved", "authorized", "captured", "confirmed"];
const PENDING_STATUSES = ["pending", "processing", "awaiting"];
const UNSUCCESSFUL_STATUSES = [
  "failed",
  "unsuccessful",
  "cancelled",
  "canceled",
  "declined",
  "invalid",
  "expired",
  "error",
];
const REFUNDED_STATUSES = ["refunded", "reversed", "chargeback"];

/** Map any raw payment status string to a normalized category. */
export function categorizeDonationStatus(status: string | null | undefined): DonationStatusCategory {
  const s = (status || "").trim().toLowerCase();
  if (!s) return "unknown";
  if (SUCCESSFUL_STATUSES.includes(s)) return "successful";
  if (APPROVED_STATUSES.includes(s)) return "approved";
  if (PENDING_STATUSES.includes(s)) return "pending";
  if (UNSUCCESSFUL_STATUSES.includes(s)) return "unsuccessful";
  if (REFUNDED_STATUSES.includes(s)) return "refunded";
  return "unknown";
}

export const DONATION_STATUS_LABELS: Record<DonationStatusCategory, string> = {
  successful: "Successful",
  approved: "Approved",
  pending: "Pending",
  unsuccessful: "Unsuccessful",
  refunded: "Refunded",
  unknown: "Unknown",
};

/** Badge styling per status category, using theme tokens. */
export const DONATION_STATUS_BADGE_CLASSES: Record<DonationStatusCategory, string> = {
  successful: "bg-charity-green-light/20 text-charity-green-light",
  approved: "bg-charity-orange/20 text-charity-orange",
  pending: "bg-charity-gold/20 text-charity-gold",
  unsuccessful: "bg-destructive/20 text-destructive",
  refunded: "bg-muted text-muted-foreground",
  unknown: "bg-muted text-muted-foreground",
};

export function donationStatusBadgeClass(status: string | null | undefined): string {
  return DONATION_STATUS_BADGE_CLASSES[categorizeDonationStatus(status)];
}

export function donationStatusLabel(status: string | null | undefined): string {
  return DONATION_STATUS_LABELS[categorizeDonationStatus(status)];
}

/** Solid dot color per category, for status legend/summary chips. */
export const DONATION_STATUS_DOT_CLASSES: Record<DonationStatusCategory, string> = {
  successful: "bg-charity-green-light",
  approved: "bg-charity-orange",
  pending: "bg-charity-gold",
  unsuccessful: "bg-destructive",
  refunded: "bg-muted-foreground",
  unknown: "bg-muted-foreground",
};
