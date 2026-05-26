import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { updateStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing." }, { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const payload = await request.text();
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    event: string;
    payload: { payment?: { entity?: { order_id?: string; status?: string; id?: string } } };
  };

  const orderId = event.payload?.payment?.entity?.order_id;
  const paymentId = event.payload?.payment?.entity?.id;
  const status = event.payload?.payment?.entity?.status;

  if (!orderId) {
    return NextResponse.json({ status: "ignored" });
  }

  await updateStore((store) => {
    const payments = store.payments.map((payment) => {
      if (payment.gatewayOrderId !== orderId) return payment;
      const nextStatus = status === "captured" ? "SUCCESS" : status === "failed" ? "FAILED" : payment.status;
      return {
        ...payment,
        gatewayPaymentId: paymentId ?? payment.gatewayPaymentId,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
    });
    return { store: { ...store, payments }, result: null };
  });

  return NextResponse.json({ status: "ok" });
}
