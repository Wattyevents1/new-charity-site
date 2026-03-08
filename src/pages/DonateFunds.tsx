import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Heart, CreditCard, Smartphone, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "Aa5hhWpyD7epL8hLGgBdrXDXAdz23pieiKj6lVRzQNzbw7sqzAcWA0_XzV2jE156k1mG6M_0hhf-uEOo";

const presetAmounts = [10, 25, 50, 100, 250, 500];

const DonateFunds = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | "">("");
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pesapal");

  const handlePresetClick = (preset: number) => { setSelectedPreset(preset); setAmount(preset); };
  const handleCustomAmount = (value: string) => { setSelectedPreset(null); setAmount(value ? parseInt(value) : ""); };

  const handlePesapalPayment = async () => {
    if (!amount || !donorEmail) {
      toast.error("Please enter an amount and email address.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pesapal-payment", {
        body: {
          amount,
          donor_name: donorName,
          donor_email: donorEmail,
          donor_phone: donorPhone,
          description: `${donationType === "monthly" ? "Monthly" : "One-time"} Donation`,
          is_recurring: donationType === "monthly",
          callback_url: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recordPayPalDonation = async (transactionId: string) => {
    try {
      const { error } = await supabase.from("donations").insert({
        amount: Number(amount),
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        payment_method: "paypal",
        transaction_id: transactionId,
        is_recurring: donationType === "monthly",
        status: "completed",
      });
      if (error) console.error("Failed to record donation:", error);

      // Send admin notification
      supabase.functions.invoke("send-notification", {
        body: {
          type: "donation",
          data: {
            amount: Number(amount),
            donor_name: donorName || "Anonymous",
            donor_email: donorEmail || "N/A",
            payment_method: "paypal",
            is_recurring: donationType === "monthly",
          },
        },
      }).catch((err) => console.error("Notification failed:", err));
    } catch (err) {
      console.error("Failed to record donation:", err);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-hero text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 text-charity-gold fill-current" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Make a Donation</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Your generosity changes lives. Every contribution, no matter the size, brings us closer to a better world.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50 shadow-elevated">
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-serif text-2xl">Choose Your Donation</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="flex gap-2 mb-8">
                  <Button variant={donationType === "one-time" ? "default" : "outline"} className="flex-1" onClick={() => setDonationType("one-time")}>One-Time</Button>
                  <Button variant={donationType === "monthly" ? "default" : "outline"} className="flex-1" onClick={() => setDonationType("monthly")}>Monthly</Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {presetAmounts.map((preset) => (
                    <button key={preset} onClick={() => handlePresetClick(preset)} className={`py-3 px-4 rounded-lg border-2 font-semibold text-lg transition-all ${selectedPreset === preset ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50 text-foreground"}`}>
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">Or enter a custom amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input id="custom-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => handleCustomAmount(e.target.value)} className="pl-8 text-lg h-12" min="1" />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-serif text-lg font-semibold">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="donor-name">Full Name</Label><Input id="donor-name" placeholder="John Doe" className="mt-1" value={donorName} onChange={(e) => setDonorName(e.target.value)} /></div>
                    <div><Label htmlFor="donor-email">Email</Label><Input id="donor-email" type="email" placeholder="john@example.com" className="mt-1" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} /></div>
                  </div>
                  <div>
                    <Label htmlFor="donor-phone">Phone (for mobile money)</Label>
                    <Input id="donor-phone" type="tel" placeholder="+256700000000" className="mt-1" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-serif text-lg font-semibold mb-4">Payment Method</h3>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="pesapal" className="gap-2"><CreditCard className="w-4 h-4" /> Card / Mobile Money</TabsTrigger>
                      <TabsTrigger value="paypal" className="gap-2"><Globe className="w-4 h-4" /> PayPal</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pesapal" className="mt-4 text-center text-muted-foreground py-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <CreditCard className="w-8 h-8 text-primary/60" />
                        <Smartphone className="w-8 h-8 text-primary/60" />
                      </div>
                      <p className="text-sm">Pay securely with Visa, Mastercard, MTN Mobile Money, or Airtel Money via Pesapal.</p>
                    </TabsContent>
                    <TabsContent value="paypal" className="mt-4">
                      {amount ? (
                        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                          <div className="py-4">
                            <p className="text-sm text-muted-foreground text-center mb-4">
                              Complete your <span className="font-semibold text-foreground">${amount}</span> donation securely with PayPal
                            </p>
                            <PayPalButtons
                              style={{ layout: "vertical", shape: "rect", label: "donate" }}
                              createOrder={(_data, actions) => {
                                return actions.order.create({
                                  intent: "CAPTURE",
                                  purchase_units: [{
                                    amount: {
                                      value: String(amount),
                                      currency_code: "USD",
                                    },
                                    description: `${donationType === "monthly" ? "Monthly" : "One-time"} Donation to Al-Imran Muslim Aid`,
                                  }],
                                });
                              }}
                              onApprove={async (_data, actions) => {
                                const order = await actions.order?.capture();
                                if (order) {
                                  const txId = order.purchase_units?.[0]?.payments?.captures?.[0]?.id || order.id;
                                  await recordPayPalDonation(txId || "paypal");
                                  navigate(`/donation/callback?gateway=paypal&status=success&transaction_id=${encodeURIComponent(txId || "")}`);
                                }
                              }}
                              onError={(err) => {
                                console.error("PayPal error:", err);
                                navigate("/donation/callback?gateway=paypal&status=failed");
                              }}
                              onCancel={() => {
                                navigate("/donation/callback?gateway=paypal&status=cancelled");
                              }}
                            />
                            <p className="text-xs text-muted-foreground text-center mt-3">🔒 Secured by PayPal</p>
                          </div>
                        </PayPalScriptProvider>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground">
                          <Globe className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                          <p className="text-sm">Please select or enter a donation amount above to see PayPal options.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {activeTab === "pesapal" && (
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-lg rounded-xl" disabled={!amount || loading} onClick={handlePesapalPayment}>
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Heart className="w-5 h-5 mr-2 fill-current" />}
                    {loading ? "Processing..." : `Donate ${amount ? `$${amount}` : ""} ${donationType === "monthly" ? "Monthly" : ""}`}
                  </Button>
                )}
                <p className="text-center text-xs text-muted-foreground mt-4">Your donation is secure and encrypted. You'll receive a receipt via email.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DonateFunds;
