import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtpSession } from "@/lib/otp";
import { loadStore } from "@/lib/store";
import { sendOtpSms } from "@/lib/sms";
import { phoneSchema } from "@/lib/validators";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  phoneNumber: phoneSchema,
  role: z.enum(["CUSTOMER", "SALON_OWNER", "ADMIN"]).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const role = (parsed.data.role ?? "CUSTOMER") as UserRole;

  const store = await loadStore();
  if (role !== "CUSTOMER") {
    const existing = store.users.find(
      (user) => user.phoneNumber === parsed.data.phoneNumber && user.role === role
    );
    if (!existing) {
      return NextResponse.json(
        { error: "Role not provisioned for this phone number." },
        { status: 403 }
      );
    }
  }

  try {
    const session = await createOtpSession(parsed.data.phoneNumber, role);
    await sendOtpSms(parsed.data.phoneNumber, session.code);
    return NextResponse.json({ status: "sent" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
