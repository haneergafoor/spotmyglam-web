type SmsProvider = "twilio" | "msg91" | "demo";

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to send SMS.`);
  }
  return value;
};

export const sendOtpSms = async (phoneNumber: string, code: string) => {
  const provider = (process.env.SMS_PROVIDER ?? "twilio") as SmsProvider;
  const message = `SpotMyGlam OTP: ${code}. Valid for 5 minutes.`;
  const normalized = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+91${phoneNumber}`;

  // Demo mode: Skip SMS sending if credentials not configured
  if (!process.env.TWILIO_ACCOUNT_SID && !process.env.MSG91_AUTH_KEY) {
    console.log(
      `📱 Demo Mode: OTP for ${phoneNumber} is ${code} (SMS not configured)`
    );
    return; // Silently succeed in demo mode
  }

  if (provider === "twilio") {
    const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
    const authToken = requireEnv("TWILIO_AUTH_TOKEN");
    const from = requireEnv("TWILIO_FROM_NUMBER");
    const twilio = (await import("twilio")).default;
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from,
      to: normalized,
    });
    return;
  }

  if (provider === "msg91") {
    const authKey = requireEnv("MSG91_AUTH_KEY");
    const templateId = requireEnv("MSG91_TEMPLATE_ID");
    const baseUrl = process.env.MSG91_BASE_URL ?? "https://api.msg91.com/api/v5/otp";
    const url = new URL(baseUrl);
    url.searchParams.set("authkey", authKey);
    url.searchParams.set("mobile", normalized.replace("+", ""));
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("otp", code);
    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MSG91 OTP failed: ${errorBody}`);
    }
    return;
  }

  throw new Error("Unsupported SMS provider.");
};