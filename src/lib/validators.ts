import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/u, "Enter a valid 10-digit phone number.");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/u, "Enter a valid 6-digit OTP.");