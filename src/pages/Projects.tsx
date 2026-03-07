import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useProjectDonations } from "@/hooks/useProjectDonations";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const donationTotals = useProjectDonations();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .in("status", ["published", "completed"])
        .order("created_at", { ascending: false });
      setProjects(data || []);
    };
    fetchProjects();
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Our Projects</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Explore our initiatives and see how your contributions create lasting change.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat!)} className="text-xs">
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((project) => {
              const goal = project.funding_goal || 1;
              const donated = donationTotals[project.id];
              const raised = donated ? donated.total_amount : (project.amount_raised || 0);
              const percentage = Math.min(Math.round((raised / goal) * 100), 100);
              return (
                <Card key={project.id} className="overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50">
                  <div className="relative overflow-hidden aspect-[3/2]">
                    <img src={project.image_url || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full backdrop-blur-sm">{project.category}</span>
                      {project.status === "completed" && <span className="px-3 py-1 bg-charity-gold/90 text-foreground text-xs font-medium rounded-full backdrop-blur-sm">Completed</span>}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" /><span>{project.location}</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">${raised.toLocaleString()}</span>
                        <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{percentage}% funded</span>
                        <Link to={`/projects/${project.id}`}>
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs">{project.status === "completed" ? "View" : "Donate"}</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No projects found matching your search.</p></div>}
        </div>
      </section>
    </Layout>
  );
};

export default Projects;
