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

// Convert 2-letter country code to flag emoji
const toFlag = (cc: string) =>
  cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));

const countryCodes = [
  { code: "+1", cc: "US" },
  { code: "+44", cc: "GB" },
  { code: "+93", cc: "AF" },
  { code: "+355", cc: "AL" },
  { code: "+213", cc: "DZ" },
  { code: "+376", cc: "AD" },
  { code: "+244", cc: "AO" },
  { code: "+54", cc: "AR" },
  { code: "+374", cc: "AM" },
  { code: "+61", cc: "AU" },
  { code: "+43", cc: "AT" },
  { code: "+994", cc: "AZ" },
  { code: "+973", cc: "BH" },
  { code: "+880", cc: "BD" },
  { code: "+375", cc: "BY" },
  { code: "+32", cc: "BE" },
  { code: "+501", cc: "BZ" },
  { code: "+229", cc: "BJ" },
  { code: "+975", cc: "BT" },
  { code: "+591", cc: "BO" },
  { code: "+387", cc: "BA" },
  { code: "+267", cc: "BW" },
  { code: "+55", cc: "BR" },
  { code: "+673", cc: "BN" },
  { code: "+359", cc: "BG" },
  { code: "+226", cc: "BF" },
  { code: "+257", cc: "BI" },
  { code: "+855", cc: "KH" },
  { code: "+237", cc: "CM" },
  { code: "+1", cc: "CA" },
  { code: "+236", cc: "CF" },
  { code: "+235", cc: "TD" },
  { code: "+56", cc: "CL" },
  { code: "+86", cc: "CN" },
  { code: "+57", cc: "CO" },
  { code: "+269", cc: "KM" },
  { code: "+243", cc: "CD" },
  { code: "+242", cc: "CG" },
  { code: "+506", cc: "CR" },
  { code: "+225", cc: "CI" },
  { code: "+385", cc: "HR" },
  { code: "+53", cc: "CU" },
  { code: "+357", cc: "CY" },
  { code: "+420", cc: "CZ" },
  { code: "+45", cc: "DK" },
  { code: "+253", cc: "DJ" },
  { code: "+593", cc: "EC" },
  { code: "+20", cc: "EG" },
  { code: "+503", cc: "SV" },
  { code: "+240", cc: "GQ" },
  { code: "+291", cc: "ER" },
  { code: "+372", cc: "EE" },
  { code: "+268", cc: "SZ" },
  { code: "+251", cc: "ET" },
  { code: "+679", cc: "FJ" },
  { code: "+358", cc: "FI" },
  { code: "+33", cc: "FR" },
  { code: "+241", cc: "GA" },
  { code: "+220", cc: "GM" },
  { code: "+995", cc: "GE" },
  { code: "+49", cc: "DE" },
  { code: "+233", cc: "GH" },
  { code: "+30", cc: "GR" },
  { code: "+502", cc: "GT" },
  { code: "+224", cc: "GN" },
  { code: "+592", cc: "GY" },
  { code: "+509", cc: "HT" },
  { code: "+504", cc: "HN" },
  { code: "+852", cc: "HK" },
  { code: "+36", cc: "HU" },
  { code: "+354", cc: "IS" },
  { code: "+91", cc: "IN" },
  { code: "+62", cc: "ID" },
  { code: "+98", cc: "IR" },
  { code: "+964", cc: "IQ" },
  { code: "+353", cc: "IE" },
  { code: "+972", cc: "IL" },
  { code: "+39", cc: "IT" },
  { code: "+876", cc: "JM" },
  { code: "+81", cc: "JP" },
  { code: "+962", cc: "JO" },
  { code: "+7", cc: "KZ" },
  { code: "+254", cc: "KE" },
  { code: "+965", cc: "KW" },
  { code: "+996", cc: "KG" },
  { code: "+856", cc: "LA" },
  { code: "+371", cc: "LV" },
  { code: "+961", cc: "LB" },
  { code: "+266", cc: "LS" },
  { code: "+231", cc: "LR" },
  { code: "+218", cc: "LY" },
  { code: "+370", cc: "LT" },
  { code: "+352", cc: "LU" },
  { code: "+261", cc: "MG" },
  { code: "+265", cc: "MW" },
  { code: "+60", cc: "MY" },
  { code: "+960", cc: "MV" },
  { code: "+223", cc: "ML" },
  { code: "+356", cc: "MT" },
  { code: "+222", cc: "MR" },
  { code: "+230", cc: "MU" },
  { code: "+52", cc: "MX" },
  { code: "+373", cc: "MD" },
  { code: "+976", cc: "MN" },
  { code: "+382", cc: "ME" },
  { code: "+212", cc: "MA" },
  { code: "+258", cc: "MZ" },
  { code: "+95", cc: "MM" },
  { code: "+264", cc: "NA" },
  { code: "+977", cc: "NP" },
  { code: "+31", cc: "NL" },
  { code: "+64", cc: "NZ" },
  { code: "+505", cc: "NI" },
  { code: "+227", cc: "NE" },
  { code: "+234", cc: "NG" },
  { code: "+850", cc: "KP" },
  { code: "+389", cc: "MK" },
  { code: "+47", cc: "NO" },
  { code: "+968", cc: "OM" },
  { code: "+92", cc: "PK" },
  { code: "+507", cc: "PA" },
  { code: "+675", cc: "PG" },
  { code: "+595", cc: "PY" },
  { code: "+51", cc: "PE" },
  { code: "+63", cc: "PH" },
  { code: "+48", cc: "PL" },
  { code: "+351", cc: "PT" },
  { code: "+974", cc: "QA" },
  { code: "+40", cc: "RO" },
  { code: "+7", cc: "RU" },
  { code: "+250", cc: "RW" },
  { code: "+966", cc: "SA" },
  { code: "+221", cc: "SN" },
  { code: "+381", cc: "RS" },
  { code: "+232", cc: "SL" },
  { code: "+65", cc: "SG" },
  { code: "+421", cc: "SK" },
  { code: "+386", cc: "SI" },
  { code: "+252", cc: "SO" },
  { code: "+27", cc: "ZA" },
  { code: "+82", cc: "KR" },
  { code: "+211", cc: "SS" },
  { code: "+34", cc: "ES" },
  { code: "+94", cc: "LK" },
  { code: "+249", cc: "SD" },
  { code: "+597", cc: "SR" },
  { code: "+46", cc: "SE" },
  { code: "+41", cc: "CH" },
  { code: "+963", cc: "SY" },
  { code: "+886", cc: "TW" },
  { code: "+992", cc: "TJ" },
  { code: "+255", cc: "TZ" },
  { code: "+66", cc: "TH" },
  { code: "+228", cc: "TG" },
  { code: "+216", cc: "TN" },
  { code: "+90", cc: "TR" },
  { code: "+993", cc: "TM" },
  { code: "+256", cc: "UG" },
  { code: "+380", cc: "UA" },
  { code: "+971", cc: "AE" },
  { code: "+598", cc: "UY" },
  { code: "+998", cc: "UZ" },
  { code: "+58", cc: "VE" },
  { code: "+84", cc: "VN" },
  { code: "+967", cc: "YE" },
  { code: "+260", cc: "ZM" },
  { code: "+263", cc: "ZW" },
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
