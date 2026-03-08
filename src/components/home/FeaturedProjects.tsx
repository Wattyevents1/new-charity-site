import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useProjectDonations } from "@/hooks/useProjectDonations";
import { useCurrency } from "@/hooks/useCurrency";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const donationTotals = useProjectDonations();
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);
      setProjects(data || []);
    };
    fetchProjects();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[hsl(42,80%,92%)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              Featured Projects
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Your generosity fuels these life-changing initiatives. See how your donations make an impact.
            </p>
          </div>
          <Link to="/projects">
            <Button variant="outline" className="gap-2">
              View All Projects <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => {
            const goal = project.funding_goal || 1;
            const donated = donationTotals[project.id];
            const raised = donated ? donated.total_amount : (project.amount_raised || 0);
            const percentage = Math.min(Math.round((raised / goal) * 100), 100);
            return (
              <Card key={project.id} className="overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50">
                <div className="relative overflow-hidden aspect-[3/2]">
                  <img
                    src={project.image_url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.location}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{formatAmount(raised)}</span>
                      <span className="text-muted-foreground">of {formatAmount(goal)}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{percentage}% funded</span>
                      <Link to={`/projects/${project.id}`}>
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                          Donate
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;