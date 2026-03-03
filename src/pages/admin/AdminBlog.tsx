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

interface BlogPost {
  id: string; title: string; excerpt: string | null; content: string | null;
  image_url: string | null; author: string | null; category: string | null;
  status: string; created_at: string; published_at: string | null;
}

const emptyForm = { title: "", excerpt: "", content: "", image_url: "", author: "", category: "", status: "draft" };

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "list", entity: "blog_posts" },
    });
    if (error) { toast.error("Failed to load posts"); return; }
    setPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async () => {
    const payload = { ...form, published_at: form.status === "published" ? new Date().toISOString() : null };
    const body = editingId
      ? { action: "update", entity: "blog_posts", id: editingId, data: payload }
      : { action: "create", entity: "blog_posts", data: payload };
    const { data, error } = await supabase.functions.invoke("admin-api", { body });
    if (error || data?.error) { toast.error(data?.error || "Save failed"); return; }
    toast.success(editingId ? "Post updated" : "Post created");
    setOpen(false); setForm(emptyForm); setEditingId(null); fetchPosts();
  };

  const handleEdit = (p: BlogPost) => {
    setForm({ title: p.title, excerpt: p.excerpt || "", content: p.content || "", image_url: p.image_url || "", author: p.author || "", category: p.category || "", status: p.status });
    setEditingId(p.id); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { data, error } = await supabase.functions.invoke("admin-api", {
      body: { action: "delete", entity: "blog_posts", id },
    });
    if (error || data?.error) { toast.error(data?.error || "Delete failed"); return; }
    toast.success("Post deleted"); fetchPosts();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold">Blog Posts</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New Post</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif">{editingId ? "Edit" : "New"} Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="mt-1" /></div>
              <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="mt-1" /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">{editingId ? "Update" : "Create"} Post</Button>
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
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.author || "—"}</TableCell>
                  <TableCell>{p.category || "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No blog posts yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminBlog;
