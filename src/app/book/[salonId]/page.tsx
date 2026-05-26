"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Salon, Service } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type BookingStep = 1 | 2 | 3 | 4;

type SalonDetails = {
  salon: Salon;
  services: Service[];
};

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { contact: string; name: string };
  handler: (response: RazorpayHandlerResponse) => void;
  theme: { color: string };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function BookingPage({ params }: { params: { salonId: string } }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>(1);
  const [details, setDetails] = useState<SalonDetails | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [slot, setSlot] = useState("11:00");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(`/api/salon-details?salonId=${params.salonId}`);
      const data = (await response.json()) as SalonDetails;
      setDetails(data);
      if (serviceId) {
        const found = data.services.find((service) => service.id === serviceId);
        if (found) setSelectedService(found);
      }
    };
    fetchDetails();
  }, [params.salonId, serviceId]);

  const slots = useMemo(
    () => ["10:00", "11:00", "13:00", "15:00", "17:00", "19:00"],
    []
  );

  const proceedPayment = async () => {
    if (!selectedService || !user) return;
    setLoading(true);
    setPaymentStatus(null);
    try {
      const bookingResponse = await fetch("/api/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: params.salonId,
          serviceId: selectedService.id,
          bookingDate: date,
          slotStartTime: slot,
          slotEndTime: slot,
        }),
      });
      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        setPaymentStatus(bookingData.error ?? "Booking failed.");
        return;
      }
      setBookingId(bookingData.booking.id);

      const orderResponse = await fetch("/api/create-payment-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        setPaymentStatus(orderData.error ?? "Payment order failed.");
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        setPaymentStatus("Razorpay SDK failed to load.");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SpotMyGlam",
        description: selectedService.name,
        order_id: orderData.orderId,
        prefill: {
          contact: user.phoneNumber,
          name: user.fullName ?? "SpotMyGlam User",
        },
        handler: async (response: RazorpayHandlerResponse) => {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: bookingData.booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyResponse.json();
          if (verifyResponse.ok) {
            setPaymentStatus("Payment successful. Booking confirmed.");
            setStep(4);
          } else {
            setPaymentStatus(verifyData.error ?? "Payment verification failed.");
          }
        },
        theme: { color: "#000000" },
      };

      if (!window.Razorpay) {
        setPaymentStatus("Razorpay is unavailable.");
        return;
      }
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } finally {
      setLoading(false);
    }
  };

  if (!details) {
    return <div className="px-6 py-12 text-sm text-black/60">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <SectionHeading>Login required</SectionHeading>
          <p className="mt-2 text-sm text-black/60">
            Please login with OTP to continue booking.
          </p>
          <Link href="/auth">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <SectionHeading>Book your appointment</SectionHeading>
      <div className="flex flex-wrap gap-2 text-xs text-black/60">
        <Badge>Step {step} of 4</Badge>
        {details.salon.name}
      </div>

      {step === 1 && (
        <div className="grid gap-4">
          {details.services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={[
                "flex flex-col items-start gap-2 rounded-3xl border px-6 py-5 text-left",
                selectedService?.id === service.id
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black",
              ].join(" ")}
            >
              <span className="font-display text-lg">{service.name}</span>
              <span className="text-sm opacity-70">{service.description}</span>
              <span className="text-xs opacity-60">
                {service.durationMinutes} mins • {formatCurrency(service.price)}
              </span>
            </button>
          ))}
          <Button
            onClick={() => setStep(2)}
            disabled={!selectedService}
            className="w-fit"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 rounded-3xl border border-black/10 bg-white p-6">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-black/40">
              Select date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-black/40">
              Select time slot
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((slotValue) => (
                <button
                  key={slotValue}
                  onClick={() => setSlot(slotValue)}
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-medium",
                    slot === slotValue
                      ? "border-black bg-black text-white"
                      : "border-black/20 bg-white text-black/70",
                  ].join(" ")}
                >
                  {slotValue}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Review booking</Button>
          </div>
        </div>
      )}

      {step === 3 && selectedService && (
        <div className="rounded-3xl border border-black/10 bg-white p-6 space-y-4">
          <SectionHeading>Booking summary</SectionHeading>
          <div className="text-sm text-black/70">
            <p>Salon: {details.salon.name}</p>
            <p>Service: {selectedService.name}</p>
            <p>Date: {date}</p>
            <p>Time: {slot}</p>
            <p>Total: {formatCurrency(selectedService.price)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={proceedPayment} disabled={loading}>
              {loading ? "Processing..." : "Proceed to payment"}
            </Button>
          </div>
          {paymentStatus ? (
            <p className="text-sm text-black/70">{paymentStatus}</p>
          ) : null}
        </div>
      )}

      {step === 4 && (
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <SectionHeading>Booking confirmed</SectionHeading>
          <p className="mt-2 text-sm text-black/70">
            Your booking is confirmed and payment is verified. Booking ID:{" "}
            {bookingId}
          </p>
          <Link href="/bookings">
            <Button className="mt-4">View booking history</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
