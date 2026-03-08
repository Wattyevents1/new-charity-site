import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVolunteerNotifications } from "@/hooks/useVolunteerNotifications";
import { LayoutDashboard, FolderKanban, Heart, Users, FileText, Mail, Briefcase, AlertTriangle, Package, Crown, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Donations", path: "/admin/donations", icon: Heart },
  { label: "Volunteers", path: "/admin/volunteers", icon: Users },
  { label: "Blog Posts", path: "/admin/blog", icon: FileText },
  { label: "Contact Messages", path: "/admin/contacts", icon: Mail },
  { label: "Careers", path: "/admin/careers", icon: Briefcase },
  { label: "Appeals", path: "/admin/appeals", icon: AlertTriangle },
  { label: "Item Donations", path: "/admin/item-donations", icon: Package },
  { label: "Memberships", path: "/admin/memberships", icon: Crown },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-serif text-lg font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
            <Home className="w-4 h-4" /> View Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
