import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBookingHistory, enrichBooking } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const history = await getBookingHistory(session.userId);
  const bookings = await Promise.all(history.map(enrichBooking));
  return NextResponse.json({ bookings });
}
