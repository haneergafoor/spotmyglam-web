import { updateStore, loadStore } from "./store";
import type { OtpSession, UserRole } from "./types";

const OTP_EXPIRY_MINUTES = 10; // Increased from 5 to 10 minutes
const OTP_MAX_ATTEMPTS = 10; // Increased from 5 to 10 for demo

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const nowIso = () => new Date().toISOString();

// In-memory fallback for demo mode (when filesystem is read-only)
const inMemoryOtpSessions = new Map<string, OtpSession>();

export const createOtpSession = async (phoneNumber: string, role: UserRole) => {
  const code = generateCode();
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  ).toISOString();
  const session: OtpSession = {
    phoneNumber,
    code,
    expiresAt,
    attempts: 0,
    role,
    createdAt: nowIso(),
  };

  // Always store in memory for demo mode (Vercel)
  inMemoryOtpSessions.set(phoneNumber, session);

  try {
    // Also try to store in persistent store if available
    await updateStore((store) => {
      const filtered = store.otpSessions.filter(
        (item) => item.phoneNumber !== phoneNumber
      );
      return {
        store: { ...store, otpSessions: [...filtered, session] },
        result: null,
      };
    });
  } catch (error) {
    // If store update fails, continue with in-memory session
    console.warn("⚠️  Store update failed, using in-memory session", error);
  }

  return session;
};

type OtpVerifyResult =
  | { ok: true; role: UserRole }
  | { ok: false; error: string };

export const verifyOtpSession = async (
  phoneNumber: string,
  code: string
): Promise<OtpVerifyResult> => {
  // First check in-memory sessions (faster, works in all modes)
  const inMemorySession = inMemoryOtpSessions.get(phoneNumber);

  if (inMemorySession) {
    // Check expiry
    if (new Date() > new Date(inMemorySession.expiresAt)) {
      inMemoryOtpSessions.delete(phoneNumber);
      return { ok: false, error: "OTP expired." };
    }

    // Check attempts
    if (inMemorySession.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, error: "OTP attempts exceeded." };
    }

    // Check code - accept any 6-digit number in demo mode
    const isDemoMode = !process.env.TWILIO_ACCOUNT_SID && !process.env.MSG91_AUTH_KEY;
    const isValidCode = isDemoMode ? /^\d{6}$/.test(code) : inMemorySession.code === code;

    if (!isValidCode) {
      inMemorySession.attempts += 1;
      return { ok: false, error: "Invalid OTP." };
    }

    // Success - remove session
    inMemoryOtpSessions.delete(phoneNumber);
    return { ok: true, role: inMemorySession.role };
  }

  // Fallback to store (for persistent storage)
  return updateStore<OtpVerifyResult>((store) => {
    const sessionIndex = store.otpSessions.findIndex(
      (item) => item.phoneNumber === phoneNumber
    );
    if (sessionIndex === -1) {
      return {
        store,
        result: { ok: false, error: "OTP session not found." },
      };
    }

    const session = store.otpSessions[sessionIndex];
    if (new Date() > new Date(session.expiresAt)) {
      const nextSessions = store.otpSessions.filter(
        (item) => item.phoneNumber !== phoneNumber
      );
      return {
        store: { ...store, otpSessions: nextSessions },
        result: { ok: false, error: "OTP expired." },
      };
    }

    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      return {
        store,
        result: { ok: false, error: "OTP attempts exceeded." },
      };
    }

    // In demo mode, accept any 6-digit OTP
    const isDemoMode = !process.env.TWILIO_ACCOUNT_SID && !process.env.MSG91_AUTH_KEY;
    const isValidCode = isDemoMode ? /^\d{6}$/.test(code) : session.code === code;

    if (!isValidCode) {
      const nextSessions = [...store.otpSessions];
      nextSessions[sessionIndex] = {
        ...session,
        attempts: session.attempts + 1,
      };
      return {
        store: { ...store, otpSessions: nextSessions },
        result: { ok: false, error: "Invalid OTP." },
      };
    }

    const nextSessions = store.otpSessions.filter(
      (item) => item.phoneNumber !== phoneNumber
    );
    return {
      store: { ...store, otpSessions: nextSessions },
      result: { ok: true, role: session.role },
    };
  });
};
