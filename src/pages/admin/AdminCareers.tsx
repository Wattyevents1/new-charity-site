import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Career {
  id: string; title: string; description: string | null; requirements: string | null;
  location: string | null; employment_type: string | null; status: string; created_at: string;
}

const emptyForm = { title: "", description: "", requirements: "", location: "", employment_type: "Full-time", status: "open" };

const AdminCareers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchCareers = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "careers" },
    });
    if (error) { toast.error("Failed to load careers"); return; }
    setCareers(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchCareers(); }, []);

  const handleSave = async () => {
    const body = editingId
      ? { action: "update", entity: "careers", id: editingId, data: form }
      : { action: "create", entity: "careers", data: form };
    const { data, error } = await supabase.functions.invoke("admin-api", { body });
    if (error || data?.error) { toast.error(data?.error || "Save failed"); return; }
    toast.success(editingId ? "Job updated" : "Job created");
    setOpen(false); setForm(emptyForm); setEditingId(null); fetchCareers();
  };

  const handleEdit = (c: Career) => {
    setForm({ title: c.title, description: c.description || "", requirements: c.requirements || "", location: c.location || "", employment_type: c.employment_type || "Full-time", status: c.status });
    setEditingId(c.id); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "delete", entity: "careers", id },
    });
    if (error || data?.error) { toast.error(data?.error || "Delete failed"); return; }
    toast.success("Job deleted"); fetchCareers();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold">Careers</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Job</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-serif">{editingId ? "Edit" : "New"} Job Listing</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" /></div>
              <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" /></div>
                <div><Label>Type</Label><Input value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="mt-1" /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editingId ? "Update" : "Create"} Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.location || "—"}</TableCell>
                  <TableCell>{c.employment_type || "—"}</TableCell>
                  <TableCell><Badge variant={c.status === "open" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {careers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No job listings yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCareers;
