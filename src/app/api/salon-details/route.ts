import { NextResponse } from "next/server";
import { getSalonDetails } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const salonId = searchParams.get("salonId");
  if (!salonId) {
    return NextResponse.json({ error: "salonId is required" }, { status: 400 });
  }
  const data = await getSalonDetails(salonId);
  if (!data) {
    return NextResponse.json({ error: "Salon not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
