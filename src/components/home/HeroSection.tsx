import { Link } from "react-router-dom";
import { ArrowRight, Users, Building2, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-community.jpg";
import { useReveal } from "@/hooks/useReveal";

const HeroSection = () => {
  const copyRef = useReveal<HTMLDivElement>(0);
  const imageRef = useReveal<HTMLDivElement>(120);
  const statsRef = useReveal<HTMLDivElement>(240);

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:auto-rows-[minmax(0,1fr)] md:grid-rows-6 md:min-h-[750px]">
          {/* Editorial content block */}
          <div
            ref={copyRef}
            className="reveal-on-scroll md:col-span-7 md:row-span-4 rounded-3xl border border-border bg-card p-8 md:p-12 flex flex-col justify-center shadow-card"
          >
            <span className="text-accent font-bold tracking-[0.2em] uppercase text-xs mb-5">
              Faith in action &bull; Uganda &amp; East Africa
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-medium leading-[1.08] text-foreground mb-6">
              Empowering communities through{" "}
              <span className="italic text-charity-orange-light">sustainable</span> compassion.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed mb-10">
              Al-Imran Muslim Aid delivers emergency relief and long-term development — clean water,
              education, food and orphan care — to those in need, regardless of race or religion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/donate">
                <Button
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.99]"
                >
                  Donate Now
                </Button>
              </Link>
              <Link to="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 py-6 text-base font-bold border-2 border-border text-foreground hover:bg-secondary group"
                >
                  Our Projects
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Main visual block */}
          <div
            ref={imageRef}
            className="reveal-on-scroll md:col-span-5 md:row-span-6 relative rounded-3xl overflow-hidden group min-h-[320px] shadow-elevated"
          >
            <img
              src={heroImage}
              alt="A volunteer serving a warm meal to smiling children outside a community centre in Uganda"
              width={1024}
              height={1408}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />
            <blockquote className="absolute bottom-8 left-8 right-8 font-serif italic text-lg leading-snug text-primary-foreground">
              &ldquo;The best of people are those most useful to people.&rdquo;
            </blockquote>
          </div>

          {/* Impact tiles */}
          <div
            ref={statsRef}
            className="reveal-on-scroll md:col-span-7 md:row-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="rounded-3xl bg-charity-gold p-7 flex flex-col justify-between min-h-[160px]">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </span>
              <span className="block mt-6">
                <span className="block font-serif text-4xl font-bold text-primary">50+</span>
                <span className="block text-primary/80 font-semibold uppercase tracking-wider text-xs mt-1">
                  Active donors
                </span>
              </span>
            </div>

            <div className="rounded-3xl bg-charity-orange-light p-7 flex flex-col justify-between min-h-[160px]">
              <span className="w-10 h-10 rounded-full bg-background/25 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </span>
              <span className="block mt-6">
                <span className="block font-serif text-4xl font-bold text-primary-foreground">50+</span>
                <span className="block text-primary-foreground/90 font-semibold uppercase tracking-wider text-xs mt-1">
                  Projects delivered
                </span>
              </span>
            </div>

            <div className="rounded-3xl bg-primary p-7 flex flex-col justify-between min-h-[160px]">
              <span className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-charity-gold" />
              </span>
              <span className="block mt-6">
                <span className="block font-serif text-4xl font-bold text-charity-gold">02</span>
                <span className="block text-charity-gold/80 font-semibold uppercase tracking-wider text-xs mt-1">
                  Countries impacted
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
