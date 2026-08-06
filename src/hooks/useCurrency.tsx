import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  BASE_CURRENCY,
  currencies,
  currencySymbol,
  convertAmount,
  formatCurrency,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

export { currencies, currencyOptions, BASE_CURRENCY } from "@/lib/currency";
export type { CurrencyCode } from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  /** Format a base-currency (EUR) amount in the selected currency. */
  formatAmount: (amountInBase: number) => string;
  /** Convert a base-currency (EUR) amount into the selected currency. */
  convert: (amountInBase: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: BASE_CURRENCY,
  symbol: currencySymbol(BASE_CURRENCY),
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

  const handleSetCurrency = useCallback((code: CurrencyCode) => {
    setCurrency(code);
    localStorage.setItem("preferred-currency", code);
  }, []);

  const formatAmount = useCallback((amountInBase: number) => formatCurrency(amountInBase, currency), [currency]);
  const convert = useCallback((amountInBase: number) => convertAmount(amountInBase, currency), [currency]);

  const value = useMemo(
    () => ({
      currency,
      symbol: currencySymbol(currency),
      setCurrency: handleSetCurrency,
      formatAmount,
      convert,
    }),
    [currency, handleSetCurrency, formatAmount, convert]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
