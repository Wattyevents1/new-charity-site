import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ItemDonation {
  id: string; donor_name: string; donor_email: string; donor_phone: string | null;
  category: string | null; item_description: string; pickup_location: string | null;
  status: string; created_at: string;
}

const AdminItemDonations = () => {
  const [items, setItems] = useState<ItemDonation[]>([]);

  const fetchItems = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "item_donations" },
    });
    if (error) { toast.error("Failed to load item donations"); return; }
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchItems(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "update", entity: "item_donations", id, data: { status } },
    });
    if (error || data?.error) { toast.error(data?.error || "Update failed"); return; }
    toast.success("Status updated");
    fetchItems();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Item Donations</h1>
        <p className="text-muted-foreground mt-1">{items.length} submissions</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.donor_name}</TableCell>
                  <TableCell>{item.donor_email}</TableCell>
                  <TableCell>{item.category || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.item_description}</TableCell>
                  <TableCell>{item.pickup_location || "—"}</TableCell>
                  <TableCell>
                    <Select value={item.status} onValueChange={(val) => updateStatus(item.id, val)}>
                      <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="collected">Collected</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No item donations yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminItemDonations;
