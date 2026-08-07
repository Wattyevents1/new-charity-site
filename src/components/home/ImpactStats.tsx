import { useEffect, useState, useRef } from "react";
import { Heart, Users, Globe, Briefcase } from "lucide-react";

const stats = [
  { icon: Heart, label: "Funds Raised", value: 40000, prefix: "$", suffix: "+", format: true },
  { icon: Users, label: "Lives Impacted", value: 1000, prefix: "", suffix: "+", format: true },
  { icon: Globe, label: "Projects Completed", value: 90, prefix: "", suffix: "", format: false },
  { icon: Briefcase, label: "Active Volunteers", value: 20, prefix: "", suffix: "+", format: false },
];

function formatNumber(num: number, shouldFormat: boolean): string {
  if (!shouldFormat) return num.toString();
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
}

const CounterCard = ({ icon: Icon, label, value, prefix, suffix, format }: typeof stats[0]) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="rounded-3xl bg-card border border-border p-7 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 md:even:mt-8"
    >
      <div className="w-12 h-12 mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1">
        {prefix}{formatNumber(count, format)}{suffix}
      </div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
};

const ImpactStats = () => {
  return (
    <section className="relative py-20 md:py-28 bg-secondary/60 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full bg-charity-gold/20 blur-3xl"
      />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mb-14">
          <span className="text-accent font-bold tracking-[0.2em] uppercase text-xs">
            Measured, transparent, accountable
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mt-4 mb-5 leading-tight">
            Our impact, in <span className="italic text-charity-orange-light">numbers</span>.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Every donation, every volunteer hour, every act of kindness adds up to create meaningful
            change in the communities we serve.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <CounterCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
