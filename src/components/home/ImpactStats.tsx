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
    <div ref={ref} className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-7 h-7 text-accent" />
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
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every donation, every volunteer hour, every act of kindness adds up to create meaningful change.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <CounterCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
