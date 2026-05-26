import { getSalons } from "@/lib/data";
import { SalonsClient } from "@/components/salons/SalonsClient";

const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
};

export default async function SalonsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q ?? "";
  const salons = await getSalons({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
    query,
  });

  return <SalonsClient initialSalons={salons} initialQuery={query} />;
}
