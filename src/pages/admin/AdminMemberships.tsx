import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Membership {
  id: string; donor_name: string | null; donor_email: string;
  tier: string; status: string; created_at: string;
}

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const fetchMemberships = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "memberships" },
    });
    if (error) { toast.error("Failed to load memberships"); return; }
    setMemberships(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchMemberships(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "update", entity: "memberships", id, data: { status } },
    });
    if (error || data?.error) { toast.error(data?.error || "Update failed"); return; }
    toast.success("Status updated");
    fetchMemberships();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Memberships</h1>
        <p className="text-muted-foreground mt-1">{memberships.length} members</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.donor_name || "—"}</TableCell>
                  <TableCell>{m.donor_email}</TableCell>
                  <TableCell><Badge variant="outline">{m.tier}</Badge></TableCell>
                  <TableCell>
                    <Select value={m.status} onValueChange={(val) => updateStatus(m.id, val)}>
                      <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(m.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {memberships.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No memberships yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminMemberships;
