import { HomePage } from "@/components/home/HomePage";
import { getHomeWidgets } from "@/lib/data";

const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
};

export default async function Home() {
  const widgets = await getHomeWidgets({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
  });
  return <HomePage initialData={widgets} />;
}
