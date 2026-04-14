import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type DonationStatus = "success" | "failed" | "cancelled" | "pending" | "loading";

const statusConfig = {
  success: {
    icon: CheckCircle,
    title: "Thank You for Your Donation! 🤲",
    message: "Your generous contribution has been received successfully. May Allah reward you abundantly.",
    iconColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  failed: {
    icon: XCircle,
    title: "Payment Failed",
    message: "Unfortunately your payment could not be processed. Please try again or use a different payment method.",
    iconColor: "text-destructive",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
  cancelled: {
    icon: XCircle,
    title: "Payment Cancelled",
    message: "Your payment was cancelled. No charges were made. You can try again whenever you're ready.",
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted/30",
  },
  pending: {
    icon: Clock,
    title: "Payment Processing",
    message: "Your payment is being processed. You'll receive a confirmation once it's complete.",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  loading: {
    icon: Loader2,
    title: "Verifying Payment...",
    message: "Please wait while we confirm your transaction.",
    iconColor: "text-primary",
    bgColor: "bg-muted/30",
  },
};

const DonationCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DonationStatus>("loading");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const gateway = searchParams.get("gateway");
    const result = searchParams.get("status");
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const merchantRef = searchParams.get("OrderMerchantReference");
    const txId = searchParams.get("transaction_id");

    if (txId) setTransactionId(txId);
    if (merchantRef) setTransactionId(merchantRef);

    if (gateway === "paypal") {
      const paypalToken = searchParams.get("token");
      if (paypalToken) {
        // User returned from PayPal — capture payment server-side
        capturePayPalOrder(paypalToken);
        return;
      }
      if (result === "success") setStatus("success");
      else if (result === "cancelled") setStatus("cancelled");
      else setStatus("failed");
      return;
    }

    // Pesapal callback - check transaction status via edge function
    if (orderTrackingId) {
      checkPesapalStatus(orderTrackingId, merchantRef);
    } else if (result) {
      // Fallback for explicit status param
      if (result === "success") setStatus("success");
      else if (result === "cancelled") setStatus("cancelled");
      else setStatus("failed");
    } else {
      setStatus("pending");
    }
  }, [searchParams]);

  const capturePayPalOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("paypal-payment", {
        body: { action: "capture-order", order_id: orderId },
      });
      if (error) throw error;
      if (data?.status === "completed") {
        setStatus("success");
        if (data.transaction_id) setTransactionId(data.transaction_id);
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("PayPal capture error:", err);
      setStatus("failed");
    }
  };

  const checkPesapalStatus = async (orderTrackingId: string, merchantRef: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke("pesapal-payment", {
        body: { action: "check-status", order_tracking_id: orderTrackingId, merchant_reference: merchantRef },
      });

      if (error) throw error;

      if (data?.status === "completed") {
        setStatus("success");
        if (data.transaction_id) setTransactionId(data.transaction_id);
      } else if (data?.status === "failed") {
        setStatus("failed");
      } else {
        setStatus("pending");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setStatus("pending");
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Layout>
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className={`border-border/50 shadow-elevated ${config.bgColor}`}>
              <CardContent className="p-8 md:p-12 text-center">
                <Icon
                  className={`w-16 h-16 mx-auto mb-6 ${config.iconColor} ${status === "loading" ? "animate-spin" : ""}`}
                />
                <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {config.title}
                </h1>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {config.message}
                </p>

                {transactionId && status === "success" && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Transaction Reference: <span className="font-mono font-medium">{transactionId}</span>
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(status === "failed" || status === "cancelled") && (
                    <Button onClick={() => navigate("/donate")} size="lg">
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant={status === "success" ? "default" : "outline"}
                    onClick={() => navigate("/")}
                    size="lg"
                  >
                    Back to Home
                  </Button>
                  {status === "success" && (
                    <Button variant="outline" onClick={() => navigate("/projects")} size="lg">
                      View Projects
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DonationCallback;
