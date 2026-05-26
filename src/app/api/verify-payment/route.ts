import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { updateStore } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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
    const result = await updateStore((store) => {
      const booking = store.bookings.find((item) => item.id === parsed.data.bookingId);
      if (!booking) {
        throw new Error("Booking not found.");
      }
      if (booking.customerId !== session.userId) {
        throw new Error("Not allowed.");
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        throw new Error("RAZORPAY_KEY_SECRET is missing.");
      }
      const signature = createHmac("sha256", secret)
        .update(`${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`)
        .digest("hex");

      if (signature !== parsed.data.razorpay_signature) {
        throw new Error("Payment signature verification failed.");
      }

      const payments: typeof store.payments = store.payments.map((payment) =>
        payment.gatewayOrderId === parsed.data.razorpay_order_id
          ? {
              ...payment,
              gatewayPaymentId: parsed.data.razorpay_payment_id,
              status: "SUCCESS",
              updatedAt: new Date().toISOString(),
            }
          : payment
      );

      const bookings: typeof store.bookings = store.bookings.map((item) =>
        item.id === booking.id
          ? {
              ...item,
              status: "CONFIRMED",
              paymentStatus: "SUCCESS",
              updatedAt: new Date().toISOString(),
            }
          : item
      );

      return { store: { ...store, payments, bookings }, result: booking };
    });

    return NextResponse.json({ booking: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
