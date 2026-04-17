import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Heart, Users, FolderKanban, Mail, FileText, Package, Crown, Repeat } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import LogoSpinner from "@/components/ui/LogoSpinner";

interface RecentDonation {
  id: string;
  donor_name: string | null;
  amount: number;
  created_at: string;
  status: string | null;
  payment_method: string | null;
  project_id: string | null;
  project_title?: string | null;
}

interface ProjectProgress {
  name: string;
  progress: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    donations: 0,
    totalAmount: 0,
    projects: 0,
    volunteers: 0,
    contacts: 0,
    blogPosts: 0,
    itemDonations: 0,
    memberships: 0,
    recurring: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [progressData, setProgressData] = useState<ProjectProgress[]>([]);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchStats = async () => {
      const [donationsRes, projectsRes, recentRes, adminStats] = await Promise.all([
        supabase.from("donations").select("amount, created_at, is_recurring, status"),
        supabase.from("projects").select("id, title, funding_goal, amount_raised").eq("status", "published"),
        supabase
          .from("donations")
          .select("id, donor_name, amount, created_at, status, payment_method, project_id")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.functions.invoke("admin-api", { body: { action: "dashboard_stats" } }),
      ]);

      const allDonations = donationsRes.data || [];
      const totalAmount = allDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const recurring = allDonations.filter((d) => d.is_recurring).length;
      const apiStats = adminStats.data || {};

      // Build last 12 months data
      const now = new Date();
      const months: { month: string; amount: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.toLocaleString("en", { month: "short" }),
          amount: 0,
        });
      }
      allDonations.forEach((d) => {
        if (d.status !== "completed") return;
        const date = new Date(d.created_at);
        const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        if (diff >= 0 && diff < 12) {
          months[11 - diff].amount += Number(d.amount) || 0;
        }
      });
      setMonthlyData(months);

      // Project progress (top 5 by progress)
      const projects = projectsRes.data || [];
      const progress = projects
        .map((p) => ({
          name: p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
          progress: p.funding_goal && Number(p.funding_goal) > 0
            ? Math.min(100, Math.round((Number(p.amount_raised) || 0) / Number(p.funding_goal) * 100))
            : 0,
        }))
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5);
      setProgressData(progress);

      const projectMap = new Map(projects.map((p) => [p.id, p.title]));
      const recent = (recentRes.data || []).map((d) => ({
        ...d,
        project_title: d.project_id ? projectMap.get(d.project_id) || null : null,
      }));
      setRecentDonations(recent);

      setStats({
        donations: allDonations.length,
        totalAmount,
        projects: projects.length,
        volunteers: apiStats.volunteers || 0,
        contacts: apiStats.contacts || 0,
        blogPosts: apiStats.blogPosts || 0,
        itemDonations: apiStats.itemDonations || 0,
        memberships: apiStats.memberships || 0,
        recurring,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const topCards = [
    { label: "Total Raised", value: formatAmount(stats.totalAmount), sub: `${stats.donations} donations`, icon: Heart },
    { label: "Donors", value: stats.donations, sub: "Total donations", icon: Users },
    { label: "Active Projects", value: stats.projects, sub: "Published", icon: FolderKanban },
    { label: "Recurring", value: stats.recurring, sub: "Recurring donations", icon: Repeat },
  ];

  const secondaryCards = [
    { label: "Volunteers", value: stats.volunteers, icon: Users },
    { label: "Blog Posts", value: stats.blogPosts, icon: FileText },
    { label: "Contact Messages", value: stats.contacts, icon: Mail },
    { label: "Item Donations", value: stats.itemDonations, icon: Package },
    { label: "Memberships", value: stats.memberships, icon: Crown },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <LogoSpinner message="Loading dashboard..." />
      ) : (
        <div className="grid gap-6 animate-fade-in">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back. Here's an overview of your organization.</p>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {topCards.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-serif text-2xl font-bold">{s.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif">Donations (last 12 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ amount: { label: "Amount", color: "hsl(var(--primary))" } }}
                  className="h-80 w-full"
                >
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {progressData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published projects yet.</p>
                ) : (
                  <ChartContainer
                    config={{ progress: { label: "Progress %", color: "hsl(var(--accent))" } }}
                    className="h-80 w-full"
                  >
                    <BarChart data={progressData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" radius={[4, 4, 4, 4]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Donations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-serif">Recent Donations</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/donations" className="gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentDonations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No donations yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDonations.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.donor_name || "Anonymous"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {d.project_title || <span className="italic">General</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">
                            {d.payment_method || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmount(Number(d.amount) || 0)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.status === "completed"
                                ? "bg-charity-green-light/20 text-charity-green-light"
                                : d.status === "pending"
                                ? "bg-charity-gold/20 text-charity-gold"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {d.status || "unknown"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {secondaryCards.map((s) => (
              <Card key={s.label} className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-serif text-xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
