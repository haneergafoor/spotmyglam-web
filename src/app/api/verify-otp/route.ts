import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { verifyOtpSession } from "@/lib/otp";
import { updateStore } from "@/lib/store";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { otpSchema, phoneSchema } from "@/lib/validators";
import type { User } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  phoneNumber: phoneSchema,
  otp: otpSchema,
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const result = await verifyOtpSession(parsed.data.phoneNumber, parsed.data.otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const user = await updateStore((store) => {
      const existing = store.users.find(
        (item) => item.phoneNumber === parsed.data.phoneNumber
      );
      if (existing && existing.role !== result.role) {
        throw new Error("Role mismatch for this phone number.");
      }
      const now = new Date().toISOString();
      if (existing) {
        const updatedUser: User = { ...existing, lastLogin: now, updatedAt: now };
        const users = store.users.map((item) =>
          item.id === existing.id ? updatedUser : item
        );
        return { store: { ...store, users }, result: updatedUser };
      }

      const newUser: User = {
        id: randomUUID(),
        phoneNumber: parsed.data.phoneNumber,
        role: result.role,
        isVerified: true,
        isBlocked: false,
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      };
      return {
        store: { ...store, users: [...store.users, newUser] },
        result: newUser,
      };
    });

    const token = createSessionToken({
      userId: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
