import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { UserRole } from "./types";

const SESSION_COOKIE = "smg_session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  phoneNumber: string;
};

const getAuthSecret = () => {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_JWT_SECRET is required in production.");
    }
    return "spotmyglam-dev-secret";
  }
  return secret;
};

export const createSessionToken = (payload: SessionPayload) =>
  jwt.sign(payload, getAuthSecret(), { expiresIn: "7d" });

export const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, getAuthSecret()) as SessionPayload;
  } catch {
    return null;
  }
};