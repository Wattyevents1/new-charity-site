export type CurrencyCode = "EUR" | "USD" | "GBP" | "UGX";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // fallback rate relative to the base currency (EUR)
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

/* ------------------------------------------------------------------ */
/* Live exchange rates — fetched and cached one currency at a time.    */
/* ------------------------------------------------------------------ */

const RATES_ENDPOINT = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cacheKey = (code: CurrencyCode) => `fx-rate:${BASE_CURRENCY}:${code}`;

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

const memoryCache = new Map<CurrencyCode, CachedRate>();
const inFlight = new Map<CurrencyCode, Promise<number>>();

const readCache = (code: CurrencyCode): CachedRate | null => {
  const inMemory = memoryCache.get(code);
  if (inMemory) return inMemory;
  try {
    const raw = localStorage.getItem(cacheKey(code));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRate;
    if (typeof parsed?.rate !== "number" || !Number.isFinite(parsed.rate)) return null;
    memoryCache.set(code, parsed);
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (code: CurrencyCode, rate: number) => {
  const entry: CachedRate = { rate, fetchedAt: Date.now() };
  memoryCache.set(code, entry);
  try {
    localStorage.setItem(cacheKey(code), JSON.stringify(entry));
  } catch {
    /* storage unavailable — memory cache is enough */
  }
};

/** Last known rate for a currency (cache first, static fallback otherwise). */
export const getKnownRate = (code: CurrencyCode): number =>
  readCache(code)?.rate ?? currencies[code]?.rate ?? 1;

const isFresh = (entry: CachedRate | null): entry is CachedRate =>
  !!entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;

/**
 * Load the live rate for a single currency. Each currency is cached and
 * resolved independently, so switching currencies only loads that one rate.
 */
export const fetchRate = async (code: CurrencyCode): Promise<number> => {
  if (code === BASE_CURRENCY) return 1;

  const cached = readCache(code);
  if (isFresh(cached)) return cached.rate;

  const existing = inFlight.get(code);
  if (existing) return existing;

  const request = (async () => {
    try {
      const res = await fetch(RATES_ENDPOINT);
      if (!res.ok) throw new Error(`Rate request failed (${res.status})`);
      const json = await res.json();
      const rate = Number(json?.rates?.[code]);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error(`No rate for ${code}`);
      writeCache(code, rate);
      return rate;
    } catch {
      // Fall back to the last known / static rate so the UI never breaks.
      return getKnownRate(code);
    } finally {
      inFlight.delete(code);
    }
  })();

  inFlight.set(code, request);
  return request;
};

/** Convert a base-currency (EUR) amount into the given currency. */
export const convertAmount = (amountInBase: number, code: CurrencyCode, rate?: number): number =>
  Math.round((Number(amountInBase) || 0) * (rate ?? getKnownRate(code)));

/**
 * Single source of truth for rendering money in the UI.
 * `amountInBase` is always an EUR-denominated value coming from the database.
 */
export const formatCurrency = (amountInBase: number, code: CurrencyCode, rate?: number): string => {
  const info = currencies[code] ?? currencies[BASE_CURRENCY];
  const converted = convertAmount(amountInBase, info.code, rate);
  return formatInCurrency(converted, info.code);
};

/** Format an amount that is already expressed in the target currency. */
export const formatInCurrency = (amount: number, code: CurrencyCode): string => {
  const info = currencies[code] ?? currencies[BASE_CURRENCY];
  const value = (Number(amount) || 0).toLocaleString();
  // Multi-letter codes (e.g. UGX) read better with a space after the symbol.
  return info.symbol.length > 1 ? `${info.symbol} ${value}` : `${info.symbol}${value}`;
};
