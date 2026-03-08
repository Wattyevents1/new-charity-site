import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useProjectDonations } from "@/hooks/useProjectDonations";

const UrgentAppeals = () => {
  const [appeal, setAppeal] = useState<any>(null);
  const donationTotals = useProjectDonations();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .eq("category", "Emergency Relief")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setAppeal(data);
    };
    fetch();
  }, []);

  if (!appeal) return null;

  const goal = appeal.funding_goal || 1;
  const donated = donationTotals[appeal.id];
  const raised = donated ? donated.total_amount : (appeal.amount_raised || 0);
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-charity-orange/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-charity-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4 text-charity-gold" />
            <span>Urgent Appeal</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {appeal.title}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            {appeal.description}
          </p>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2">
               <span className="font-semibold">€{raised.toLocaleString()} raised</span>
               <span className="text-primary-foreground/70">Goal: €{goal.toLocaleString()}</span>
            </div>
            <Progress value={percentage} className="h-3 bg-primary-foreground/20" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-primary-foreground/70">{percentage}% complete</span>
            </div>
          </div>

          <Link to="/urgent-appeals">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-6 text-lg rounded-full shadow-warm">
              <Heart className="w-5 h-5 mr-2 fill-current" />
              Contribute Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UrgentAppeals;
