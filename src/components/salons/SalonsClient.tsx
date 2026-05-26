"use client";

import { useState } from "react";
import type { Salon } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SalonCard } from "@/components/salons/SalonCard";
import { Button } from "@/components/ui/Button";

type SalonWithDistance = Salon & { distanceKm?: number | null };

const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
};

export const SalonsClient = ({
  initialSalons,
  initialQuery,
}: {
  initialSalons: SalonWithDistance[];
  initialQuery: string;
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [salons, setSalons] = useState(initialSalons);
  const [loading, setLoading] = useState(false);

  const fetchSalons = async (value: string) => {
    setLoading(true);
    const response = await fetch(
      `/api/nearby-salons?lat=${DEFAULT_LOCATION.lat}&lng=${DEFAULT_LOCATION.lng}&query=${encodeURIComponent(
        value
      )}`
    );
    const data = (await response.json()) as { salons: SalonWithDistance[] };
    setSalons(data.salons);
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-12">
      <div className="space-y-3">
        <SectionHeading>Salon discovery</SectionHeading>
        <p className="text-sm text-black/60">
          Search and compare salons, services, and offers within 20km.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by salon, service, or category"
          />
          <Button onClick={() => fetchSalons(query)}>Search</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-black/40">Loading salons...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {salons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      )}
    </div>
  );
};
