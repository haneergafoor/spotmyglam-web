import { NextResponse } from "next/server";
import { getSalons } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const query = searchParams.get("query") ?? undefined;
  const latValue = lat ? Number(lat) : undefined;
  const lngValue = lng ? Number(lng) : undefined;
  const salons = await getSalons({
    lat: latValue !== undefined && !Number.isNaN(latValue) ? latValue : undefined,
    lng: lngValue !== undefined && !Number.isNaN(lngValue) ? lngValue : undefined,
    query,
  });
  return NextResponse.json({ salons });
}
