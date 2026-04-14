import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { countryCodes, toFlag, DEFAULT_COUNTRY_VALUE, getDialCode } from "@/lib/countryCodes";
import { validateItemDonationForm, sanitize, MAX_LENGTHS, type ValidationError } from "@/lib/validation";

const DonateItems = () => {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_VALUE);
  const [donorPhone, setDonorPhone] = useState("");
  const [category, setCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateItemDonationForm({ donor_name: donorName, donor_email: donorEmail, item_description: itemDescription });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors below.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-forms", {
        body: {
          action: "submit_item_donation",
          data: {
            donor_name: sanitize(donorName, MAX_LENGTHS.name),
            donor_email: sanitize(donorEmail, MAX_LENGTHS.email),
            donor_phone: donorPhone ? `${getDialCode(countryCode)} ${sanitize(donorPhone, MAX_LENGTHS.phone)}` : "",
            category,
            item_description: sanitize(itemDescription, MAX_LENGTHS.description),
            pickup_location: sanitize(pickupLocation, MAX_LENGTHS.location),
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Donation offer submitted! We'll contact you soon.");
      setDonorName(""); setDonorEmail(""); setCountryCode(DEFAULT_COUNTRY_VALUE); setDonorPhone(""); setCategory(""); setItemDescription(""); setPickupLocation(""); setErrors({});
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
          <Package className="w-12 h-12 mx-auto mb-6 text-charity-gold" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Donate Items & Food</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Your gently used items and food donations help families in need.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border/50 shadow-card">
            <CardHeader><CardTitle className="font-serif text-2xl">Submit a Donation Offer</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-name">Your Name</Label>
                    <Input id="item-name" placeholder="Your name" className="mt-1" value={donorName} onChange={(e) => setDonorName(e.target.value)} maxLength={MAX_LENGTHS.name} />
                    {errors.donor_name && <p className="text-xs text-destructive mt-1">{errors.donor_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="item-email">Email</Label>
                    <Input id="item-email" type="email" placeholder="you@example.com" className="mt-1" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} maxLength={MAX_LENGTHS.email} />
                    {errors.donor_email && <p className="text-xs text-destructive mt-1">{errors.donor_email}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="item-phone">Phone Number</Label>
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
                    <Input id="item-phone" type="tel" placeholder="701 703 951" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} maxLength={MAX_LENGTHS.phone} />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue placeholder="What are you donating?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="food">Food & Groceries</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="books">Books & Supplies</SelectItem>
                      <SelectItem value="medical">Medical Supplies</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-desc">Item Description</Label>
                  <Textarea id="item-desc" placeholder="Describe the items you'd like to donate..." rows={3} className="mt-1" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} maxLength={MAX_LENGTHS.description} />
                  <div className="flex justify-between mt-1">
                    {errors.item_description && <p className="text-xs text-destructive">{errors.item_description}</p>}
                    <p className="text-xs text-muted-foreground ml-auto">{itemDescription.length}/{MAX_LENGTHS.description}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="item-location">Pickup / Drop-off Location</Label>
                  <Input id="item-location" placeholder="Address for pickup or drop-off" className="mt-1" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} maxLength={MAX_LENGTHS.location} />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-5" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <><Package className="w-4 h-4 mr-2" />Submit Donation Offer</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default DonateItems;
