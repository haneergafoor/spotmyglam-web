"use client";

import { useState } from "react";
import type { Booking, Salon, Service } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

type OwnerBooking = Booking & { salon?: Salon; service?: Service };

type OwnerDashboardProps = {
  initialBookings: OwnerBooking[];
};

export const OwnerDashboard = ({ initialBookings }: OwnerDashboardProps) => {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (bookingId: string, status: Booking["status"]) => {
    setLoadingId(bookingId);
    const response = await fetch("/api/owner/bookings-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status }),
    });
    if (response.ok) {
      const data = (await response.json()) as { booking: OwnerBooking };
      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, ...data.booking } : item
        )
      );
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="rounded-3xl border border-black/10 bg-white p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-lg text-black">
                {booking.salon?.name ?? "Salon"} • {booking.service?.name}
              </h3>
              <p className="text-sm text-black/60">
                {booking.bookingDate} • {booking.slotStartTime}
              </p>
            </div>
            <Badge>{booking.status}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={loadingId === booking.id}
              onClick={() => updateStatus(booking.id, "CONFIRMED")}
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              disabled={loadingId === booking.id}
              onClick={() => updateStatus(booking.id, "CANCELLED")}
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              disabled={loadingId === booking.id}
              onClick={() => updateStatus(booking.id, "COMPLETED")}
            >
              Mark completed
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
