import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";
import { updateStore } from "@/lib/store";
import type { Payment } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  bookingId: z.string().min(1),
});

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
    const response = await updateStore(async (store) => {
      const booking = store.bookings.find((item) => item.id === parsed.data.bookingId);
      if (!booking) {
        throw new Error("Booking not found.");
      }
      if (booking.customerId !== session.userId) {
        throw new Error("Not allowed.");
      }

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: Math.round(booking.totalAmount * 100),
        currency: "INR",
        receipt: booking.id,
      });

      const payment: Payment = {
        id: randomUUID(),
        bookingId: booking.id,
        userId: booking.customerId,
        gatewayOrderId: order.id,
        amount: booking.totalAmount,
        currency: "INR",
        status: "CREATED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const bookings: typeof store.bookings = store.bookings.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              paymentStatus: "CREATED",
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      return {
        store: { ...store, payments: [...store.payments, payment], bookings },
        result: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: getRazorpayKeyId(),
        },
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
