export type CurrencyCode = "EUR" | "USD" | "GBP" | "UGX";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // rate relative to the base currency (EUR)
}

/** All amounts stored in the database are expressed in this currency. */
export const BASE_CURRENCY: CurrencyCode = "EUR";

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  EUR: { code: "EUR", symbol: "\u20AC", label: "Euro", rate: 1 },
  USD: { code: "USD", symbol: "$", label: "US Dollar", rate: 1.08 },
  GBP: { code: "GBP", symbol: "\u00A3", label: "Pound Sterling", rate: 0.86 },
  UGX: { code: "UGX", symbol: "UGX", label: "Ugandan Shilling", rate: 4050 },
};

export const currencyOptions: CurrencyCode[] = ["EUR", "USD", "GBP", "UGX"];

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === "string" && value in currencies;

/** Symbol for a currency code (never falls back to "$"). */
export const currencySymbol = (code: CurrencyCode): string =>
  currencies[code]?.symbol ?? currencies[BASE_CURRENCY].symbol;

/** Convert a base-currency (EUR) amount into the given currency. */
export const convertAmount = (amountInBase: number, code: CurrencyCode): number =>
  Math.round((Number(amountInBase) || 0) * (currencies[code]?.rate ?? 1));

/**
 * Single source of truth for rendering money in the UI.
 * `amountInBase` is always an EUR-denominated value coming from the database.
 */
export const formatCurrency = (amountInBase: number, code: CurrencyCode): string => {
  const info = currencies[code] ?? currencies[BASE_CURRENCY];
  const converted = convertAmount(amountInBase, info.code);
  const value = converted.toLocaleString();
  // Multi-letter codes (e.g. UGX) read better with a space after the symbol.
  return info.symbol.length > 1 ? `${info.symbol} ${value}` : `${info.symbol}${value}`;
};

/** Format an amount that is already expressed in the target currency. */
export const formatInCurrency = (amount: number, code: CurrencyCode): string => {
  const info = currencies[code] ?? currencies[BASE_CURRENCY];
  const value = (Number(amount) || 0).toLocaleString();
  return info.symbol.length > 1 ? `${info.symbol} ${value}` : `${info.symbol}${value}`;
};
