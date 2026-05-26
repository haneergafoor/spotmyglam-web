import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const store = await loadStore();
  const user = store.users.find((item) => item.id === session.userId) ?? null;
  return NextResponse.json({ user });
}
