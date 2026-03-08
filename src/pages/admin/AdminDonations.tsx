import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/useCurrency";
import type { Tables } from "@/integrations/supabase/types";

type Donation = Tables<"donations">;

const AdminDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    supabase.from("donations").select("*").order("created_at", { ascending: false }).then(({ data }) => setDonations(data || []));
  }, []);

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Donations</h1>
        <p className="text-muted-foreground mt-1">Total: {formatAmount(totalAmount)} from {donations.length} donations</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.donor_name || "Anonymous"}</TableCell>
                  <TableCell>{d.donor_email || "\u2014"}</TableCell>
                  <TableCell className="font-semibold">{formatAmount(d.amount)}</TableCell>
                  <TableCell>{d.payment_method || "\u2014"}</TableCell>
                  <TableCell><Badge variant={d.is_recurring ? "default" : "secondary"}>{d.is_recurring ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {donations.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No donations yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDonations;