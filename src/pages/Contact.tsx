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
import { validateContactForm, sanitize, MAX_LENGTHS, type ValidationError } from "@/lib/validation";

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
  const [errors, setErrors] = useState<ValidationError>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm({ name, email, message, subject });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors below.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-forms", {
        body: {
          action: "submit_contact",
          data: {
            name: sanitize(name, MAX_LENGTHS.name),
            email: sanitize(email, MAX_LENGTHS.email),
            subject: sanitize(subject, MAX_LENGTHS.subject),
            message: sanitize(message, MAX_LENGTHS.message),
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Message sent! We'll get back to you soon.");
      setName(""); setEmail(""); setSubject(""); setMessage(""); setErrors({});
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
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your name" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_LENGTHS.name} />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={MAX_LENGTHS.email} />
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={MAX_LENGTHS.subject} />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us more..." rows={5} className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX_LENGTHS.message} />
                      <div className="flex justify-between mt-1">
                        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                        <p className="text-xs text-muted-foreground ml-auto">{message.length}/{MAX_LENGTHS.message}</p>
                      </div>
                    </div>
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
