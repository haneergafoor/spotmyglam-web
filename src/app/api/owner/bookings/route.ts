import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOwnerBookings, enrichBooking } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SALON_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await getOwnerBookings(session.userId);
  const enriched = await Promise.all(bookings.map(enrichBooking));
  return NextResponse.json({ bookings: enriched });
}
