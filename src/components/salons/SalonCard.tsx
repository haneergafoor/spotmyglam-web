import Link from "next/link";
import type { Salon } from "@/lib/types";
import { Badge } from "../ui/Badge";

type SalonCardProps = {
  salon: Salon & { distanceKm?: number | null };
  highlight?: string;
};

export const SalonCard = ({ salon, highlight }: SalonCardProps) => (
  <Link
    href={`/salons/${salon.id}`}
    className="group flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-5 transition hover:border-black/30"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-display text-lg text-black">{salon.name}</h3>
        <p className="text-sm text-black/60">{salon.city}</p>
      </div>
      <div className="text-right text-sm text-black/70">
        <div className="font-medium">{salon.averageRating.toFixed(1)} ★</div>
        {salon.distanceKm != null && (
          <div>{salon.distanceKm.toFixed(1)} km</div>
        )}
      </div>
    </div>
    <p className="text-sm text-black/70">{salon.description}</p>
    <div className="flex flex-wrap gap-2">
      {salon.categories.map((category) => (
        <Badge key={category}>{category}</Badge>
      ))}
      {highlight ? <Badge className="border-black/30">{highlight}</Badge> : null}
    </div>
  </Link>
);
