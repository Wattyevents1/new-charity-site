import Layout from "@/components/layout/Layout";
import { Target, Eye, MapPin, Users, Heart, Briefcase } from "lucide-react";
import teamImran from "@/assets/team-imran.jpg";
import teamTwaha from "@/assets/team-twaha.jpg";
import teamMariam from "@/assets/team-mariam.jpg";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            A few Muslim brothers from Uganda making effort to serve humanity in East Africa.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To empower underserved communities through sustainable development programs in education, healthcare, water, and food security, creating pathways to self-sufficiency and dignity.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A world where every individual has access to clean water, quality education, nutritious food, and the opportunity to live with dignity and hope for the future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4 text-foreground">Who We Are</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We are a few Muslim brothers from Uganda who have made effort to serve humanity in Uganda in East Africa. Uganda is located above Tanzania and borders Kenya on the East, in the heart of Africa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4 text-foreground">What We Do</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do a number of charity projects in Uganda. We also join up and help other charities in helping people and orphans. We present 22 sadaqah opportunities to help you please Allah, and obtain the Jannah bi'idhnillah.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4 text-foreground">Where We Work</h2>
                <div className="text-muted-foreground leading-relaxed space-y-2">
                  <p>Uganda in East Africa — City of Mbale, in the communities of Eastern Uganda.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Known as the Bugisu Sub-Region</li>
                    <li>70% Muslim dominated area</li>
                    <li>560,000 population</li>
                    <li>Official language: English (several other languages also spoken)</li>
                  </ul>
                  <p className="text-xs mt-3 text-muted-foreground/70">
                    Al-Imran Muslim Aid is a project of SERVING HUMANITY Uganda — Registered Charity Number: STK5026/2021
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Briefcase className="w-7 h-7 text-accent" />
                </div>
                <h2 className="font-serif text-2xl font-bold mb-4 text-foreground">About the Manager</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    My name is <span className="font-semibold text-foreground">Watiti Imran</span>. I am a revert of 5 years and my parents are from Uganda and Rwanda. I was raised in Mbale and now living in Entebbe doing projects in Uganda. I am 26 years old.
                  </p>
                  <p>
                    I follow the Quran and Sunnah with the understanding of the Sahabah. I have a Degree in Hospitality Management and Community Work. I am a qualified Social Worker and Network Engineer.
                  </p>
                  <p>
                    I have worked in the Rotary community helping those in need for 7 years with social issues. I hope to use my skills and experience to help the Ummah.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Meet the dedicated individuals behind Al-Imran Muslim Aid.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { name: "Watiti Imran", role: "Chairperson", image: teamImran },
              { name: "Webisa Twaha", role: "Secretary", image: teamTwaha },
              { name: "Khaukha Mariam", role: "Treasurer", image: teamMariam },
            ].map((member) => (
              <div key={member.name} className="text-center group">
                <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-border group-hover:ring-accent transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;