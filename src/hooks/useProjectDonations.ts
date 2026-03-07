import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DonationTotals = Record<string, { total_amount: number; donors_count: number }>;

export function useProjectDonations() {
  const [totals, setTotals] = useState<DonationTotals>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_project_donation_totals");
      if (data) {
        const map: DonationTotals = {};
        for (const row of data) {
          if (row.project_id) {
            map[row.project_id] = {
              total_amount: Number(row.total_amount),
              donors_count: Number(row.donors_count),
            };
          }
        }
        setTotals(map);
      }
    };
    fetch();
  }, []);

  return totals;
}
