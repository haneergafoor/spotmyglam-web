import { NextResponse } from "next/server";
import { getServicesBySalon } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const salonId = searchParams.get("salonId");
  if (!salonId) {
    return NextResponse.json({ error: "salonId is required" }, { status: 400 });
  }
  const services = await getServicesBySalon(salonId);
  return NextResponse.json({ services });
}
