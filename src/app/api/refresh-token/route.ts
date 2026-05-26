import { NextResponse } from "next/server";
import { getSession, createSessionToken, setSessionCookie } from "@/lib/auth";
import { loadStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await loadStore();
  const user = store.users.find((item) => item.id === session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const token = createSessionToken({
    userId: user.id,
    role: user.role,
    phoneNumber: user.phoneNumber,
  });
  await setSessionCookie(token);
  return NextResponse.json({ status: "refreshed" });
}
