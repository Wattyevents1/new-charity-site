import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  BASE_CURRENCY,
  currencies,
  currencySymbol,
  convertAmount,
  formatCurrency,
  isCurrencyCode,
  fetchRate,
  getKnownRate,
  type CurrencyCode,
} from "@/lib/currency";

export { currencies, currencyOptions, BASE_CURRENCY } from "@/lib/currency";
export type { CurrencyCode } from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  /** Live rate for the selected currency relative to the base currency (EUR). */
  rate: number;
  /** True while the rate for the selected currency is being loaded. */
  loadingRate: boolean;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a base-currency (EUR) amount in the selected currency. */
  formatAmount: (amountInBase: number) => string;
  /** Convert a base-currency (EUR) amount into the selected currency. */
  convert: (amountInBase: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: BASE_CURRENCY,
  symbol: currencySymbol(BASE_CURRENCY),
  rate: 1,
  loadingRate: false,
  setCurrency: () => {},
  formatAmount: (amount) => formatCurrency(amount, BASE_CURRENCY),
  convert: (amount) => convertAmount(amount, BASE_CURRENCY),
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("preferred-currency");
    return isCurrencyCode(saved) ? saved : BASE_CURRENCY;
  });
  const [rate, setRate] = useState<number>(() => getKnownRate(currency));
  const [loadingRate, setLoadingRate] = useState(false);

  // Load the rate for the selected currency only, whenever it changes.
  useEffect(() => {
    let active = true;
    setRate(getKnownRate(currency));

    if (currency === BASE_CURRENCY) {
      setRate(1);
      setLoadingRate(false);
      return;
    }

    setLoadingRate(true);
    fetchRate(currency)
      .then((liveRate) => {
        if (active) setRate(liveRate);
      })
      .finally(() => {
        if (active) setLoadingRate(false);
      });

    return () => {
      active = false;
    };
  }, [currency]);

  const handleSetCurrency = useCallback((code: CurrencyCode) => {
    setCurrency(code);
    localStorage.setItem("preferred-currency", code);
  }, []);

  const formatAmount = useCallback(
    (amountInBase: number) => formatCurrency(amountInBase, currency, rate),
    [currency, rate]
  );
  const convert = useCallback(
    (amountInBase: number) => convertAmount(amountInBase, currency, rate),
    [currency, rate]
  );

  const value = useMemo(
    () => ({
      currency,
      symbol: currencySymbol(currency),
      rate,
      loadingRate,
      setCurrency: handleSetCurrency,
      formatAmount,
      convert,
    }),
    [currency, rate, loadingRate, handleSetCurrency, formatAmount, convert]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
