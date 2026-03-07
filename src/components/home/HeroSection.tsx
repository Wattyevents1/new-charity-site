import { Link } from "react-router-dom";
import { Heart, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero min-h-[85vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-charity-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-charity-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 opacity-0 animate-fade-in-up">
            <Heart className="w-4 h-4 fill-current text-charity-gold" />
            <span>Together, we can make a difference</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Empowering Lives,{" "}
            <span className="text-charity-gold">Inspiring Hope</span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            We believe in the power of community. Through sustainable projects, education, and compassionate action, we help transform lives across the globe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/donate">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-warm">
                <Heart className="w-5 h-5 mr-2 fill-current" />
                Donate Now
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg rounded-full">
                Our Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-primary-foreground/70 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>50+ Donors</span>
            </div>
            <div className="w-px h-4 bg-primary-foreground/20" />
            <span>50+ Projects</span>
            <div className="w-px h-4 bg-primary-foreground/20" />
            <span>20+ Countries</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 text-background">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
