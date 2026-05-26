import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getOwnerBookings, enrichBooking } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { OwnerDashboard } from "@/components/owner/OwnerDashboard";

export default async function OwnerPage() {
  const session = await getSession();
  if (!session || session.role !== "SALON_OWNER") {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <SectionHeading>Owner access required</SectionHeading>
        <p className="mt-2 text-sm text-black/60">
          Please login as a salon owner to manage bookings.
        </p>
        <Link href="/auth">
          <Button className="mt-4">Login as owner</Button>
        </Link>
      </div>
    );
  }

  const bookings = await getOwnerBookings(session.userId);
  const enriched = await Promise.all(bookings.map(enrichBooking));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12">
      <SectionHeading>Owner dashboard</SectionHeading>
      <p className="text-sm text-black/60">
        Manage incoming bookings, update status, and keep track of salon
        operations.
      </p>
      <OwnerDashboard initialBookings={enriched} />
    </div>
  );
}
