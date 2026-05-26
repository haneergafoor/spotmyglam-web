import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { updateStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  salonId: z.string().min(1),
  serviceId: z.string().min(1),
  bookingDate: z.string().min(1),
  slotStartTime: z.string().min(1),
  slotEndTime: z.string().optional(),
  notes: z.string().optional(),
});

const addMinutes = (time: string, minutes: number) => {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const nextHours = String(Math.floor(total / 60)).padStart(2, "0");
  const nextMinutes = String(total % 60).padStart(2, "0");
  return `${nextHours}:${nextMinutes}`;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const booking = await updateStore((store) => {
      const service = store.services.find((item) => item.id === parsed.data.serviceId);
      const salon = store.salons.find((item) => item.id === parsed.data.salonId);
      if (!service || !salon || service.salonId !== salon.id) {
        throw new Error("Invalid salon or service.");
      }

      const now = new Date().toISOString();
      const slotEndTime =
        parsed.data.slotEndTime ??
        addMinutes(parsed.data.slotStartTime, service.durationMinutes);

      const newBooking: Booking = {
        id: randomUUID(),
        customerId: session.userId,
        salonId: salon.id,
        serviceId: service.id,
        bookingDate: parsed.data.bookingDate,
        slotStartTime: parsed.data.slotStartTime,
        slotEndTime,
        totalAmount: service.price,
        status: "PENDING",
        paymentStatus: "PENDING",
        notes: parsed.data.notes,
        createdAt: now,
        updatedAt: now,
      };
      return {
        store: { ...store, bookings: [...store.bookings, newBooking] },
        result: newBooking,
      };
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
