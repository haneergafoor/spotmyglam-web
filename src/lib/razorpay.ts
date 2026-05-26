import Razorpay from "razorpay";

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for Razorpay.`);
  }
  return value;
};

export const getRazorpay = () =>
  new Razorpay({
    key_id: requireEnv("RAZORPAY_KEY_ID"),
    key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
  });

export const getRazorpayKeyId = () => requireEnv("RAZORPAY_KEY_ID");