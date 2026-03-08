import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Heart, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { countryCodes, toFlag, DEFAULT_COUNTRY_VALUE, getDialCode } from "@/lib/countryCodes";

const benefits = [
  { icon: Heart, title: "Make a Difference", description: "Directly impact lives in communities that need it most." },
  { icon: Users, title: "Join a Community", description: "Connect with like-minded people who share your passion." },
  { icon: Clock, title: "Flexible Hours", description: "Volunteer on your schedule \u2014 weekends, evenings, or full-time." },
  { icon: MapPin, title: "Local & Global", description: "Opportunities available in your city or abroad." },
];

const Volunteer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_VALUE);
  const [phone, setPhone] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error("Please enter your name and email."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-forms", {
        body: { action: "submit_volunteer", data: { name, email, phone: phone ? `${getDialCode(countryCode)} ${phone}` : "", area_of_interest: areaOfInterest, skills, availability } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Application submitted! We'll be in touch.");
      setName(""); setEmail(""); setPhone(""); setCountryCode(DEFAULT_COUNTRY_VALUE); setAreaOfInterest(""); setSkills(""); setAvailability("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Become a Volunteer</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Lend your time, skills, and passion to help create positive change.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent/10 flex items-center justify-center"><b.icon className="w-6 h-6 text-accent" /></div>
                <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50 shadow-card">
              <CardHeader><CardTitle className="font-serif text-2xl">Volunteer Registration</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="vol-name">Full Name</Label><Input id="vol-name" placeholder="Your name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div><Label htmlFor="vol-email">Email</Label><Input id="vol-email" type="email" placeholder="you@example.com" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="vol-phone">Phone</Label>
                      <div className="flex gap-2 mt-1">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                          <SelectTrigger className="w-[120px] shrink-0"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {countryCodes.map((c, i) => (
                              <SelectItem key={`${c.cc}-${i}`} value={`${c.cc}|${c.code}`}>
                                {toFlag(c.cc)} {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input id="vol-phone" type="tel" placeholder="701 703 951" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Area of Interest</Label>
                      <Select value={areaOfInterest} onValueChange={setAreaOfInterest}><SelectTrigger className="mt-1"><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="water">Water & Sanitation</SelectItem>
                          <SelectItem value="food">Food & Nutrition</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="admin">Administrative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label htmlFor="vol-skills">Skills & Experience</Label><Textarea id="vol-skills" placeholder="Tell us about your skills..." rows={3} className="mt-1" value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
                  <div>
                    <Label>Availability</Label>
                    <Select value={availability} onValueChange={setAvailability}><SelectTrigger className="mt-1"><SelectValue placeholder="Select availability" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="evenings">Evenings</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="fulltime">Full-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-5" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Volunteer;
