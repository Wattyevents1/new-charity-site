import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Contact {
  id: string; name: string; email: string; subject: string | null;
  message: string; is_read: boolean | null; created_at: string;
}

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "contact_submissions" },
    });
    if (error) { toast.error("Failed to load contacts"); return; }
    setContacts(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchContacts(); }, []);

  const markRead = async (id: string) => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "update", entity: "contact_submissions", id, data: { is_read: true } },
    });
    if (error || data?.error) { toast.error(data?.error || "Update failed"); return; }
    toast.success("Marked as read");
    fetchContacts();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground mt-1">{contacts.filter(c => !c.is_read).length} unread messages</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id} className={!c.is_read ? "bg-accent/5" : ""}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.subject || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.message}</TableCell>
                  <TableCell><Badge variant={c.is_read ? "secondary" : "default"}>{c.is_read ? "Read" : "New"}</Badge></TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{!c.is_read && <Button size="sm" variant="outline" onClick={() => markRead(c.id)}>Mark Read</Button>}</TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No messages yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminContacts;
