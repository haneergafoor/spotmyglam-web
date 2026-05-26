import { NextResponse } from "next/server";
import { getHomeWidgets } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const latValue = lat ? Number(lat) : undefined;
  const lngValue = lng ? Number(lng) : undefined;
  const widgets = await getHomeWidgets({
    lat: latValue !== undefined && !Number.isNaN(latValue) ? latValue : undefined,
    lng: lngValue !== undefined && !Number.isNaN(lngValue) ? lngValue : undefined,
  });
  return NextResponse.json(widgets);
}
