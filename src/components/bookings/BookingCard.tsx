import type { Booking, Salon, Service } from "@/lib/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { Badge } from "../ui/Badge";

type BookingCardProps = {
  booking: Booking & { salon?: Salon; service?: Service };
};

export const BookingCard = ({ booking }: BookingCardProps) => (
  <div className="rounded-3xl border border-black/10 bg-white p-5">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-display text-lg text-black">
          {booking.salon?.name ?? "Salon"}
        </h3>
        <p className="text-sm text-black/60">{booking.service?.name}</p>
      </div>
      <Badge>{booking.status}</Badge>
    </div>
    <div className="mt-4 grid gap-2 text-sm text-black/70 md:grid-cols-2">
      <div>Date: {formatDate(booking.bookingDate)}</div>
      <div>
        Time: {formatTime(booking.slotStartTime)} - {formatTime(booking.slotEndTime)}
      </div>
      <div>Total: {formatCurrency(booking.totalAmount)}</div>
      <div>Payment: {booking.paymentStatus}</div>
    </div>
  </div>
);
