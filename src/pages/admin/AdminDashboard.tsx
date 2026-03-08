import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, FolderKanban, Mail, FileText, Package } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ donations: 0, totalAmount: 0, projects: 0, volunteers: 0, contacts: 0, blogPosts: 0, itemDonations: 0 });
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      const [donations, projects, adminStats] = await Promise.all([
        supabase.from("donations").select("amount"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.functions.invoke("admin-api", { body: { action: "dashboard_stats" } }),
      ]);

      const totalAmount = (donations.data || []).reduce((sum, d) => sum + (d.amount || 0), 0);
      const apiStats = adminStats.data || {};

      setStats({
        donations: donations.data?.length || 0,
        totalAmount,
        projects: projects.count || 0,
        volunteers: apiStats.volunteers || 0,
        contacts: apiStats.contacts || 0,
        blogPosts: apiStats.blogPosts || 0,
        itemDonations: apiStats.itemDonations || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Donations", value: formatAmount(stats.totalAmount), sub: `${stats.donations} donations`, icon: Heart, color: "text-accent" },
    { label: "Projects", value: stats.projects, sub: "Total projects", icon: FolderKanban, color: "text-primary" },
    { label: "Volunteers", value: stats.volunteers, sub: "Applications", icon: Users, color: "text-charity-green-light" },
    { label: "Blog Posts", value: stats.blogPosts, sub: "Published & drafts", icon: FileText, color: "text-charity-gold" },
    { label: "Contact Messages", value: stats.contacts, sub: "Inbox", icon: Mail, color: "text-charity-orange" },
    { label: "Item Donations", value: stats.itemDonations, sub: "Submissions", icon: Package, color: "text-primary" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's an overview of your organization.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="font-serif text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;