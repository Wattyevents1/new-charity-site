import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { MapPin, Heart, Users, Calendar, ArrowLeft, Share2 } from "lucide-react";
import LogoSpinner from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useProjectDonations } from "@/hooks/useProjectDonations";
import { useCurrency } from "@/hooks/useCurrency";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const donationTotals = useProjectDonations();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      const { data } = await supabase.from("projects").select("*").eq("id", id).single();
      setProject(data);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LogoSpinner message="Loading project..." />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground text-lg">Project not found.</p>
          <Link to="/projects"><Button variant="outline">Back to Projects</Button></Link>
        </div>
      </Layout>
    );
  }

  const goal = project.funding_goal || 1;
  const donated = donationTotals[project.id];
  const raised = donated ? donated.total_amount : (project.amount_raised || 0);
  const donorsCount = donated ? donated.donors_count : (project.donors_count || 0);
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);
  const galleryUrls = Array.isArray(project.gallery_urls) ? (project.gallery_urls as string[]) : [];

  return (
    <Layout>
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden animate-fade-in">
        <img src={project.image_url || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
            <span className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full mb-3">{project.category}</span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">{project.title}</h1>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">About This Project</h2>
                <p className="text-muted-foreground leading-relaxed">{project.long_description || project.description}</p>
              </div>
              {galleryUrls.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold mb-4">Gallery</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryUrls.map((img, i) => (
                      <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden">
                        <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-4 text-center"><Users className="w-6 h-6 text-accent mx-auto mb-2" /><p className="font-serif text-xl font-bold">{donorsCount}</p><p className="text-xs text-muted-foreground">Donors</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4 text-center"><MapPin className="w-6 h-6 text-accent mx-auto mb-2" /><p className="font-serif text-xl font-bold">{(project.location || "").split(",")[0]}</p><p className="text-xs text-muted-foreground">Location</p></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4 text-center"><Calendar className="w-6 h-6 text-accent mx-auto mb-2" /><p className="font-serif text-xl font-bold">{project.start_date ? new Date(project.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}</p><p className="text-xs text-muted-foreground">Started</p></CardContent></Card>
              </div>
            </div>

            <div>
              <Card className="sticky top-24 border-border/50 shadow-elevated">
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-4">Support This Project</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm"><span className="font-semibold">{formatAmount(raised)}</span><span className="text-muted-foreground">of {formatAmount(goal)}</span></div>
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>{percentage}% funded</span><span>{donorsCount} donors</span></div>
                  </div>
                  <Link to="/donate"><Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-5 mb-3"><Heart className="w-4 h-4 mr-2 fill-current" />Donate Now</Button></Link>
                  <Button variant="outline" className="w-full gap-2"><Share2 className="w-4 h-4" />Share This Project</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectDetails;