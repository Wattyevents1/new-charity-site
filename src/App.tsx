import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import DonateFunds from "./pages/DonateFunds";
import DonateItems from "./pages/DonateItems";
import Membership from "./pages/Membership";
import Volunteer from "./pages/Volunteer";
import Blog from "./pages/Blog";
import UrgentAppealsPage from "./pages/UrgentAppealsPage";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminVolunteers from "./pages/admin/AdminVolunteers";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminAppeals from "./pages/admin/AdminAppeals";
import AdminItemDonations from "./pages/admin/AdminItemDonations";
import AdminMemberships from "./pages/admin/AdminMemberships";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CurrencyProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/donate" element={<DonateFunds />} />
            <Route path="/donate-items" element={<DonateItems />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/urgent-appeals" element={<UrgentAppealsPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/donations" element={<ProtectedRoute><AdminDonations /></ProtectedRoute>} />
            <Route path="/admin/volunteers" element={<ProtectedRoute><AdminVolunteers /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
            <Route path="/admin/careers" element={<ProtectedRoute><AdminCareers /></ProtectedRoute>} />
            <Route path="/admin/appeals" element={<ProtectedRoute><AdminAppeals /></ProtectedRoute>} />
            <Route path="/admin/item-donations" element={<ProtectedRoute><AdminItemDonations /></ProtectedRoute>} />
            <Route path="/admin/memberships" element={<ProtectedRoute><AdminMemberships /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
