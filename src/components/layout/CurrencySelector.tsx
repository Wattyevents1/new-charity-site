import { useCurrency } from "@/hooks/useCurrency";
import { currencies, currencyOptions, currencySymbol, type CurrencyCode } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CurrencySelector = () => {
  const { currency, setCurrency, loadingRate } = useCurrency();

  return (
    <div className="flex items-center gap-1">
      <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
        <SelectTrigger className="w-[90px] h-8 text-xs border-border/50 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((code) => (
            <SelectItem key={code} value={code} className="text-xs">
              {currencySymbol(code) === code ? code : `${currencies[code].symbol} ${code}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loadingRate && (
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" aria-label="Loading exchange rate" />
      )}
    </div>
  );
};

export default CurrencySelector;
