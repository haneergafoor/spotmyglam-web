import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getBookingHistory, enrichBooking } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingCard } from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/Button";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <SectionHeading>Login required</SectionHeading>
        <p className="mt-2 text-sm text-black/60">
          Please login to see your booking history.
        </p>
        <Link href="/auth">
          <Button className="mt-4">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const history = await getBookingHistory(session.userId);
  const bookings = await Promise.all(history.map(enrichBooking));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <SectionHeading>Booking history</SectionHeading>
      {bookings.length === 0 ? (
        <p className="text-sm text-black/60">No bookings found yet.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
