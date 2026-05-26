import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalonDetails } from "@/lib/data";
import { formatCurrency, formatTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type SalonDetailPageProps = {
  params: { salonId: string };
};

export default async function SalonDetailPage({ params }: SalonDetailPageProps) {
  const { salonId } = params;
  const data = await getSalonDetails(salonId);
  if (!data) {
    notFound();
  }

  const { salon, services } = data;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
      <div className="rounded-[32px] border border-black/10 bg-white p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="font-display text-3xl text-black">{salon.name}</h1>
            <p className="text-sm text-black/60">{salon.address}</p>
            <div className="flex flex-wrap gap-2">
              {salon.categories.map((category) => (
                <Badge key={category}>{category}</Badge>
              ))}
            </div>
          </div>
          <div className="text-right text-sm text-black/70">
            <div className="text-lg font-semibold">{salon.averageRating} ★</div>
            <div>{salon.totalReviews} reviews</div>
            <div>
              {formatTime(salon.openingTime)} - {formatTime(salon.closingTime)}
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm text-black/70">
          {salon.description}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-2xl text-black">Services</h2>
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-black/10 bg-white p-6 md:flex-row md:items-center"
            >
              <div>
                <h3 className="font-display text-lg text-black">{service.name}</h3>
                <p className="text-sm text-black/60">{service.description}</p>
                <div className="mt-2 text-xs text-black/50">
                  {service.durationMinutes} mins • {service.category}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-semibold text-black">
                  {formatCurrency(service.price)}
                </div>
                <Link href={`/book/${salon.id}?serviceId=${service.id}`}>
                  <Button>Book now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
