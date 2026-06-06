import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ImpactStats from "@/components/home/ImpactStats";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import UrgentAppeals from "@/components/home/UrgentAppeals";
import Testimonials from "@/components/home/Testimonials";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("donation") === "success") {
      toast.success("Thank you for your generous donation! May Allah reward you.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <Layout>
      <SEO
        title="Al-Imran Muslim Aid — Making a Difference Together"
        description="Support Al-Imran Muslim Aid's humanitarian projects in Uganda and East Africa. Donate, volunteer, or join urgent appeals to empower communities."
      />
      <HeroSection />
      <ImpactStats />
      <FeaturedProjects />
      <UrgentAppeals />
      <Testimonials />
    </Layout>
  );
};

export default Index;
