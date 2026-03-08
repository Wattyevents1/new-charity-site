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

const countryCodes = [
  { code: "+1", country: "US" },
  { code: "+44", country: "GB" },
  { code: "+93", country: "AF" },
  { code: "+355", country: "AL" },
  { code: "+213", country: "DZ" },
  { code: "+376", country: "AD" },
  { code: "+244", country: "AO" },
  { code: "+54", country: "AR" },
  { code: "+374", country: "AM" },
  { code: "+61", country: "AU" },
  { code: "+43", country: "AT" },
  { code: "+994", country: "AZ" },
  { code: "+973", country: "BH" },
  { code: "+880", country: "BD" },
  { code: "+375", country: "BY" },
  { code: "+32", country: "BE" },
  { code: "+501", country: "BZ" },
  { code: "+229", country: "BJ" },
  { code: "+975", country: "BT" },
  { code: "+591", country: "BO" },
  { code: "+387", country: "BA" },
  { code: "+267", country: "BW" },
  { code: "+55", country: "BR" },
  { code: "+673", country: "BN" },
  { code: "+359", country: "BG" },
  { code: "+226", country: "BF" },
  { code: "+257", country: "BI" },
  { code: "+855", country: "KH" },
  { code: "+237", country: "CM" },
  { code: "+1", country: "CA" },
  { code: "+236", country: "CF" },
  { code: "+235", country: "TD" },
  { code: "+56", country: "CL" },
  { code: "+86", country: "CN" },
  { code: "+57", country: "CO" },
  { code: "+269", country: "KM" },
  { code: "+243", country: "CD" },
  { code: "+242", country: "CG" },
  { code: "+506", country: "CR" },
  { code: "+225", country: "CI" },
  { code: "+385", country: "HR" },
  { code: "+53", country: "CU" },
  { code: "+357", country: "CY" },
  { code: "+420", country: "CZ" },
  { code: "+45", country: "DK" },
  { code: "+253", country: "DJ" },
  { code: "+593", country: "EC" },
  { code: "+20", country: "EG" },
  { code: "+503", country: "SV" },
  { code: "+240", country: "GQ" },
  { code: "+291", country: "ER" },
  { code: "+372", country: "EE" },
  { code: "+268", country: "SZ" },
  { code: "+251", country: "ET" },
  { code: "+679", country: "FJ" },
  { code: "+358", country: "FI" },
  { code: "+33", country: "FR" },
  { code: "+241", country: "GA" },
  { code: "+220", country: "GM" },
  { code: "+995", country: "GE" },
  { code: "+49", country: "DE" },
  { code: "+233", country: "GH" },
  { code: "+30", country: "GR" },
  { code: "+502", country: "GT" },
  { code: "+224", country: "GN" },
  { code: "+592", country: "GY" },
  { code: "+509", country: "HT" },
  { code: "+504", country: "HN" },
  { code: "+852", country: "HK" },
  { code: "+36", country: "HU" },
  { code: "+354", country: "IS" },
  { code: "+91", country: "IN" },
  { code: "+62", country: "ID" },
  { code: "+98", country: "IR" },
  { code: "+964", country: "IQ" },
  { code: "+353", country: "IE" },
  { code: "+972", country: "IL" },
  { code: "+39", country: "IT" },
  { code: "+876", country: "JM" },
  { code: "+81", country: "JP" },
  { code: "+962", country: "JO" },
  { code: "+7", country: "KZ" },
  { code: "+254", country: "KE" },
  { code: "+965", country: "KW" },
  { code: "+996", country: "KG" },
  { code: "+856", country: "LA" },
  { code: "+371", country: "LV" },
  { code: "+961", country: "LB" },
  { code: "+266", country: "LS" },
  { code: "+231", country: "LR" },
  { code: "+218", country: "LY" },
  { code: "+370", country: "LT" },
  { code: "+352", country: "LU" },
  { code: "+261", country: "MG" },
  { code: "+265", country: "MW" },
  { code: "+60", country: "MY" },
  { code: "+960", country: "MV" },
  { code: "+223", country: "ML" },
  { code: "+356", country: "MT" },
  { code: "+222", country: "MR" },
  { code: "+230", country: "MU" },
  { code: "+52", country: "MX" },
  { code: "+373", country: "MD" },
  { code: "+976", country: "MN" },
  { code: "+382", country: "ME" },
  { code: "+212", country: "MA" },
  { code: "+258", country: "MZ" },
  { code: "+95", country: "MM" },
  { code: "+264", country: "NA" },
  { code: "+977", country: "NP" },
  { code: "+31", country: "NL" },
  { code: "+64", country: "NZ" },
  { code: "+505", country: "NI" },
  { code: "+227", country: "NE" },
  { code: "+234", country: "NG" },
  { code: "+850", country: "KP" },
  { code: "+389", country: "MK" },
  { code: "+47", country: "NO" },
  { code: "+968", country: "OM" },
  { code: "+92", country: "PK" },
  { code: "+507", country: "PA" },
  { code: "+675", country: "PG" },
  { code: "+595", country: "PY" },
  { code: "+51", country: "PE" },
  { code: "+63", country: "PH" },
  { code: "+48", country: "PL" },
  { code: "+351", country: "PT" },
  { code: "+974", country: "QA" },
  { code: "+40", country: "RO" },
  { code: "+7", country: "RU" },
  { code: "+250", country: "RW" },
  { code: "+966", country: "SA" },
  { code: "+221", country: "SN" },
  { code: "+381", country: "RS" },
  { code: "+232", country: "SL" },
  { code: "+65", country: "SG" },
  { code: "+421", country: "SK" },
  { code: "+386", country: "SI" },
  { code: "+252", country: "SO" },
  { code: "+27", country: "ZA" },
  { code: "+82", country: "KR" },
  { code: "+211", country: "SS" },
  { code: "+34", country: "ES" },
  { code: "+94", country: "LK" },
  { code: "+249", country: "SD" },
  { code: "+597", country: "SR" },
  { code: "+46", country: "SE" },
  { code: "+41", country: "CH" },
  { code: "+963", country: "SY" },
  { code: "+886", country: "TW" },
  { code: "+992", country: "TJ" },
  { code: "+255", country: "TZ" },
  { code: "+66", country: "TH" },
  { code: "+228", country: "TG" },
  { code: "+216", country: "TN" },
  { code: "+90", country: "TR" },
  { code: "+993", country: "TM" },
  { code: "+256", country: "UG" },
  { code: "+380", country: "UA" },
  { code: "+971", country: "AE" },
  { code: "+598", country: "UY" },
  { code: "+998", country: "UZ" },
  { code: "+58", country: "VE" },
  { code: "+84", country: "VN" },
  { code: "+967", country: "YE" },
  { code: "+260", country: "ZM" },
  { code: "+263", country: "ZW" },
];

const benefits = [
  { icon: Heart, title: "Make a Difference", description: "Directly impact lives in communities that need it most." },
  { icon: Users, title: "Join a Community", description: "Connect with like-minded people who share your passion." },
  { icon: Clock, title: "Flexible Hours", description: "Volunteer on your schedule — weekends, evenings, or full-time." },
  { icon: MapPin, title: "Local & Global", description: "Opportunities available in your city or abroad." },
];

const Volunteer = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("US +1");
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
        body: { action: "submit_volunteer", data: { name, email, phone: phone ? `${countryCode.split(" ")[1] || countryCode} ${phone}` : "", area_of_interest: areaOfInterest, skills, availability } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Application submitted! We'll be in touch.");
      setName(""); setEmail(""); setPhone(""); setCountryCode("US +1"); setAreaOfInterest(""); setSkills(""); setAvailability("");
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
                          <SelectTrigger className="w-[130px] shrink-0"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {countryCodes.map((c, i) => (
                              <SelectItem key={`${c.country}-${i}`} value={`${c.country} ${c.code}`}>{c.country} {c.code}</SelectItem>
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
