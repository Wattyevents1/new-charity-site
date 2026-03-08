import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    quote: "Alhamdulillah, Al-Imran Muslim Aid built a borehole in our village in Pallisa. My children no longer walk miles for water. May Allah reward every donor.",
    name: "Babirye Nabirye",
    role: "Beneficiary, Pallisa",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    quote: "I joined the Qurbani distribution in Mbale last Eid al-Adha. Seeing orphaned children receive fresh meat and smiling — SubhanAllah, it changed my heart.",
    name: "Ibrahim Kateregga",
    role: "Volunteer, Mbale",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    quote: "I give my Zakat through Al-Imran Muslim Aid every Ramadan. Their transparency and updates on how funds are used give me full trust. Jazakallahu Khairan.",
    name: "Sadeta Arifi",
    role: "Monthly Donor, Germany",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop&crop=face",
  },
];
const Testimonials = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Voices of Change
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from the people whose lives have been touched by the generosity of our community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border/50 hover:shadow-card transition-shadow duration-300">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-accent/30 mb-4" />
                <blockquote className="text-foreground/90 text-sm leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
