import Link from "next/link";
import { getSession } from "@/lib/auth";
import { loadStore } from "@/lib/store";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <SectionHeading>Admin access required</SectionHeading>
        <p className="mt-2 text-sm text-black/60">
          Please login as admin to view platform analytics.
        </p>
        <Link href="/auth">
          <Button className="mt-4">Login as admin</Button>
        </Link>
      </div>
    );
  }

  const store = await loadStore();
  const totalBookings = store.bookings.length;
  const totalSalons = store.salons.length;
  const totalUsers = store.users.length;
  const totalRevenue = store.bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <SectionHeading>Admin dashboard</SectionHeading>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Total salons", value: totalSalons },
          { label: "Total bookings", value: totalBookings },
          { label: "Revenue", value: `₹${totalRevenue}` },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-black/10 bg-white p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              {metric.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-black">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6">
        <h3 className="font-display text-lg text-black">Latest bookings</h3>
        <div className="mt-4 space-y-3 text-sm text-black/70">
          {store.bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between border-b border-black/5 pb-3 last:border-none"
            >
              <div>
                Booking {booking.id.slice(0, 6)} • {booking.bookingDate}
              </div>
              <Badge>{booking.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
