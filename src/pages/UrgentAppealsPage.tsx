import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { AlertTriangle, Clock, Heart, MapPin } from "lucide-react";
import LogoSpinner from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const UrgentAppealsPage = () => {
  const [appeals, setAppeals] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .eq("category", "Emergency Relief")
        .order("created_at", { ascending: false });
      setAppeals(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Layout>
      <SEO
        title="Urgent Appeals"
        description="Respond to time-sensitive humanitarian needs. Support Al-Imran Muslim Aid's urgent appeals for communities facing crisis."
      />
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-6 text-charity-gold" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Urgent Appeals</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Time-sensitive campaigns that need your immediate support.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading && <LogoSpinner message="Loading appeals..." />}
          {!loading && appeals.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No urgent appeals at this time. Check back soon.</p>
            </div>
          )}
          <div className="space-y-8 animate-fade-in">
            {appeals.map((appeal) => {
              return (
                <Card key={appeal.id} className="overflow-hidden border-border/50 shadow-card">
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-[4/3] md:aspect-auto"><img src={appeal.image_url || "/placeholder.svg"} alt={appeal.title} className="w-full h-full object-cover" loading="lazy" /></div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full w-fit mb-4"><AlertTriangle className="w-3.5 h-3.5" />Urgent</div>
                      <h3 className="font-serif text-2xl font-bold mb-2">{appeal.title}</h3>
                      {appeal.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><MapPin className="w-3.5 h-3.5" /> {appeal.location}</div>
                      )}
                      <p className="text-muted-foreground text-sm mb-6 whitespace-pre-line">{appeal.long_description || appeal.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to={`/projects/${appeal.id}`}><Button variant="outline">Read more</Button></Link>
                        <Link to={`/donate?project=${appeal.id}`}><Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"><Heart className="w-4 h-4 mr-2 fill-current" />Donate Now</Button></Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UrgentAppealsPage;