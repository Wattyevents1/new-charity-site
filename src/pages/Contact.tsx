import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Plot 9 Namakwekwe, Mbale, Uganda" },
  { icon: Phone, label: "Phone", value: "+256 701 703 951" },
  { icon: Mail, label: "Email", value: "info@alimranmuslimaid.org" },
  { icon: Clock, label: "Hours", value: "Mon - Fri: 8:00 AM - 5:00 PM" },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) { toast.error("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-forms", {
        body: { action: "submit_contact", data: { name, email, subject, message } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Message sent! We'll get back to you soon.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
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
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Have questions or want to get involved? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold mb-6">Get in Touch</h2>
              {contactInfo.map((info) => (
                <Card key={info.label} className="border-border/50">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><info.icon className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-sm font-medium text-foreground">{info.label}</p><p className="text-sm text-muted-foreground">{info.value}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-card">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl font-bold mb-6">Send a Message</h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="Your name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
                      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                    </div>
                    <div><Label htmlFor="subject">Subject</Label><Input id="subject" placeholder="How can we help?" className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
                    <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="Tell us more..." rows={5} className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
