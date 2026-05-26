import { updateStore } from "./store";
import type { OtpSession, UserRole } from "./types";

const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const nowIso = () => new Date().toISOString();

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

  await updateStore((store) => {
    const filtered = store.otpSessions.filter(
      (item) => item.phoneNumber !== phoneNumber
    );
    return { store: { ...store, otpSessions: [...filtered, session] }, result: null };
  });

  return session;
};

type OtpVerifyResult =
  | { ok: true; role: UserRole }
  | { ok: false; error: string };

export const verifyOtpSession = async (
  phoneNumber: string,
  code: string
): Promise<OtpVerifyResult> =>
  updateStore<OtpVerifyResult>((store) => {
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

    if (session.code !== code) {
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
