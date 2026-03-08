import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import LogoSpinner from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Career {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  employment_type: string | null;
}

const Careers = () => {
  const [jobs, setJobs] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("public-forms", {
          body: { action: "list_open_careers" },
        });
        if (error) throw error;
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load careers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-6 text-charity-gold" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Careers</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Join our team and make your career meaningful.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl font-bold mb-8">Open Positions</h2>
          {loading ? (
            <LogoSpinner message="Loading positions..." />
          ) : (
            <div className="space-y-4 animate-fade-in">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border/50 hover:shadow-card transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{job.title}</h3>
                        {job.description && <p className="text-sm text-muted-foreground mb-3">{job.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
                          {job.employment_type && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.employment_type}</span>}
                        </div>
                      </div>
                      <Button variant="outline" className="shrink-0 gap-1">Apply <ArrowRight className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {jobs.length === 0 && <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No open positions at this time.</p></div>}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
