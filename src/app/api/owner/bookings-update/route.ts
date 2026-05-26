import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { updateStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SALON_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const booking = await updateStore((store) => {
      const index = store.bookings.findIndex((item) => item.id === parsed.data.bookingId);
      if (index === -1) {
        throw new Error("Booking not found.");
      }
      const target = store.bookings[index];
      const salon = store.salons.find((item) => item.id === target.salonId);
      if (!salon || salon.ownerId !== session.userId) {
        throw new Error("Not allowed.");
      }
      const updated: Booking = {
        ...target,
        status: parsed.data.status,
        updatedAt: new Date().toISOString(),
      };
      const bookings = [...store.bookings];
      bookings[index] = updated;
      return { store: { ...store, bookings }, result: updated };
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
