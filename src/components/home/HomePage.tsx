"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Salon } from "@/lib/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SectionHeading } from "../ui/SectionHeading";
import { SalonCard } from "../salons/SalonCard";

type SalonWithDistance = Salon & { distanceKm?: number | null };

type HomeData = {
  nearby: SalonWithDistance[];
  trending: SalonWithDistance[];
  offers: SalonWithDistance[];
  recommended: SalonWithDistance[];
};

const DEFAULT_LOCATION = {
  label: "Bengaluru",
  lat: 12.9716,
  lng: 77.5946,
};

export const HomePage = ({ initialData }: { initialData: HomeData }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HomeData>(initialData);

  const loadHome = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/home?lat=${lat}&lng=${lng}`);
      const payload = (await response.json()) as HomeData;
      setData(payload);
    } finally {
      setLoading(false);
    }
  };

  const quickCategories = useMemo(
    () => [
      "Hair Care",
      "Skin & Facial",
      "Makeup",
      "Spa & Massage",
      "Nails",
    ],
    []
  );

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          label: "Your location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(nextLocation);
        loadHome(nextLocation.lat, nextLocation.lng);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const handleSearch = () => {
    router.push(`/salons?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-black text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              SpotMyGlam
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              Your Signature Look, Just a Tap Away.
            </h1>
            <p className="max-w-xl text-base text-white/70">
              Discover top-rated salons in your area, compare services, and book
              instantly with OTP-secured access and real-time scheduling.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Search salons, services, or categories"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                Location: {location.label}
              </span>
              <Button variant="secondary" onClick={handleDetectLocation}>
                Detect Location
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => router.push(`/salons?q=${category}`)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 hover:border-white"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-[32px] border border-white/10 bg-white/5 p-10 text-white/80">
            <p className="text-sm uppercase tracking-[0.25em] text-white/40">
              Premium salons within 20km
            </p>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span>Trending services</span>
                <span className="text-white">Haircut • Facial • Nails</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span>Personalized picks</span>
                <span className="text-white">Based on time & ratings</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Instant booking</span>
                <span className="text-white">OTP secured + Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-12 px-6 py-16">
        <div className="space-y-2">
          <SectionHeading>Nearby salons</SectionHeading>
          <p className="text-sm text-black/60">
            Showing salons within 20km based on your location.
          </p>
        </div>
        {loading ? (
          <div className="text-sm text-black/40">Loading salons…</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.nearby.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading>Trending now</SectionHeading>
            <div className="grid gap-4">
              {data.trending.slice(0, 3).map((salon) => (
                <SalonCard key={salon.id} salon={salon} highlight="Trending" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SectionHeading>Offers & exclusives</SectionHeading>
            <div className="grid gap-4">
              {data.offers.slice(0, 3).map((salon) => (
                <SalonCard key={salon.id} salon={salon} highlight="Offer" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading>Recommended for you</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2">
            {data.recommended.map((salon) => (
              <SalonCard key={salon.id} salon={salon} highlight="Recommended" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};