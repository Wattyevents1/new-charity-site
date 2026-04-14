const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]*$/;

export const MAX_LENGTHS = {
  name: 100,
  email: 255,
  phone: 20,
  subject: 200,
  message: 2000,
  skills: 500,
  description: 1000,
  location: 300,
} as const;

/** Strip HTML-sensitive chars to prevent injection */
export function sanitize(value: string, maxLen: number): string {
  return value.replace(/[<>"'`;]/g, "").slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim()) && email.length <= MAX_LENGTHS.email;
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone) && phone.length <= MAX_LENGTHS.phone;
}

export type ValidationError = Record<string, string>;

export function validateRequired(fields: Record<string, string>, required: string[]): ValidationError {
  const errors: ValidationError = {};
  for (const key of required) {
    if (!fields[key]?.trim()) {
      errors[key] = "This field is required";
    }
  }
  return errors;
}

export function validateContactForm(data: { name: string; email: string; message: string; subject?: string }): ValidationError {
  const errors = validateRequired(data, ["name", "email", "message"]);
  if (data.email && !isValidEmail(data.email)) errors.email = "Please enter a valid email address";
  if (data.name && data.name.length > MAX_LENGTHS.name) errors.name = `Name must be under ${MAX_LENGTHS.name} characters`;
  if (data.message && data.message.length > MAX_LENGTHS.message) errors.message = `Message must be under ${MAX_LENGTHS.message} characters`;
  return errors;
}

export function validateVolunteerForm(data: { name: string; email: string; phone?: string }): ValidationError {
  const errors = validateRequired(data, ["name", "email"]);
  if (data.email && !isValidEmail(data.email)) errors.email = "Please enter a valid email address";
  if (data.phone && !isValidPhone(data.phone)) errors.phone = "Please enter a valid phone number";
  return errors;
}

export function validateDonationForm(data: { donor_email: string; amount?: number | "" }): ValidationError {
  const errors: ValidationError = {};
  if (!data.donor_email?.trim()) errors.donor_email = "Email is required";
  else if (!isValidEmail(data.donor_email)) errors.donor_email = "Please enter a valid email address";
  if (data.amount !== undefined) {
    const num = Number(data.amount);
    if (!data.amount || isNaN(num) || num <= 0) errors.amount = "Please enter a valid amount";
    if (num > 1_000_000) errors.amount = "Amount cannot exceed $1,000,000";
  }
  return errors;
}

export function validateItemDonationForm(data: { donor_name: string; donor_email: string; item_description: string }): ValidationError {
  const errors = validateRequired(data, ["donor_name", "donor_email", "item_description"]);
  if (data.donor_email && !isValidEmail(data.donor_email)) errors.donor_email = "Please enter a valid email address";
  if (data.item_description && data.item_description.length > MAX_LENGTHS.description) errors.item_description = `Description must be under ${MAX_LENGTHS.description} characters`;
  return errors;
}

export function validateMembershipForm(data: { email: string }): ValidationError {
  const errors: ValidationError = {};
  if (!data.email?.trim()) errors.email = "Email is required";
  else if (!isValidEmail(data.email)) errors.email = "Please enter a valid email address";
  return errors;
}
