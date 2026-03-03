import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Volunteer {
  id: string; name: string; email: string; phone: string | null;
  area_of_interest: string | null; availability: string | null; status: string; created_at: string;
}

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const fetchVolunteers = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "volunteers" },
    });
    if (error) { toast.error("Failed to load volunteers"); return; }
    setVolunteers(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchVolunteers(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "update", entity: "volunteers", id, data: { status } },
    });
    if (error || data?.error) { toast.error(data?.error || "Update failed"); return; }
    toast.success(`Status updated to ${status}`);
    fetchVolunteers();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Volunteers</h1>
        <p className="text-muted-foreground mt-1">{volunteers.length} applications</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.phone || "—"}</TableCell>
                  <TableCell>{v.area_of_interest || "—"}</TableCell>
                  <TableCell>{v.availability || "—"}</TableCell>
                  <TableCell>
                    <Select value={v.status} onValueChange={(val) => updateStatus(v.id, val)}>
                      <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {volunteers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No volunteers yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminVolunteers;
