"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";

type Step = "phone" | "otp";

const roles = [
  { label: "Customer", value: "CUSTOMER" },
  { label: "Salon Owner", value: "SALON_OWNER" },
  { label: "Admin", value: "ADMIN" },
];

export default function AuthPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, role }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "Failed to send OTP.");
      return;
    }
    setStep("otp");
    setMessage("OTP sent successfully.");
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, otp }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "OTP verification failed.");
      return;
    }
    await refresh();
    if (data.user?.role === "SALON_OWNER") {
      router.push("/owner");
    } else if (data.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/salons");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl text-black">Login with OTP</h1>
        <p className="mt-2 text-sm text-black/60">
          Secure, passwordless access for customers, salon owners, and admins.
        </p>

        {step === "phone" ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/40">
                Phone Number
              </label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter 10-digit mobile number"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/40">
                Role
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRole(option.value)}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-medium",
                      role === option.value
                        ? "border-black bg-black text-white"
                        : "border-black/20 bg-white text-black/70",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-black/40">
                OTP
              </label>
              <Input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={verifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
              >
                Change number
              </Button>
            </div>
          </div>
        )}

        {message ? <p className="mt-4 text-sm text-black/70">{message}</p> : null}

        <div className="mt-6 rounded-2xl bg-[#f5f5f5] p-4 text-xs text-black/60">
          Use admin phone <strong>9990000000</strong> or owner phone{" "}
          <strong>9990001111</strong> for demo access.
        </div>
      </div>
    </div>
  );
}
