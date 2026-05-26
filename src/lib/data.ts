import { haversineDistanceKm } from "./geo";
import { loadStore } from "./store";
import type { Booking, Salon, Service } from "./types";

type LocationQuery = {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  query?: string;
};

const withDistance = (salon: Salon, lat?: number, lng?: number) => {
  if (lat == null || lng == null) {
    return { ...salon, distanceKm: null };
  }
  const distanceKm = haversineDistanceKm(lat, lng, salon.latitude, salon.longitude);
  return { ...salon, distanceKm };
};

export const getSalons = async (query: LocationQuery = {}) => {
  const store = await loadStore();
  const normalizedQuery = query.query?.toLowerCase();
  const radius = query.radiusKm ?? 20;
  return store.salons
    .filter((salon) => salon.isActive)
    .filter((salon) => {
      if (!normalizedQuery) return true;
      return (
        salon.name.toLowerCase().includes(normalizedQuery) ||
        salon.city.toLowerCase().includes(normalizedQuery) ||
        salon.categories.some((category) =>
          category.toLowerCase().includes(normalizedQuery)
        )
      );
    })
    .map((salon) => withDistance(salon, query.lat, query.lng))
    .filter((salon) => {
      if (salon.distanceKm == null) return true;
      return salon.distanceKm <= radius;
    })
    .sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.averageRating - a.averageRating;
    });
};

export const getSalonDetails = async (salonId: string) => {
  const store = await loadStore();
  const salon = store.salons.find((item) => item.id === salonId);
  if (!salon) return null;
  const services = store.services.filter(
    (service) => service.salonId === salonId && service.isActive
  );
  return { salon, services };
};

export const getServicesBySalon = async (salonId: string) => {
  const store = await loadStore();
  return store.services.filter(
    (service) => service.salonId === salonId && service.isActive
  );
};

export const getHomeWidgets = async (query: LocationQuery = {}) => {
  const salons = await getSalons(query);
  const trending = [...salons].sort((a, b) => b.totalReviews - a.totalReviews);
  const recommended = [...salons].sort((a, b) => b.averageRating - a.averageRating);
  const offers = salons.filter((salon) => salon.offers.length > 0);
  return {
    nearby: salons.slice(0, 6),
    trending: trending.slice(0, 6),
    offers: offers.slice(0, 6),
    recommended: recommended.slice(0, 6),
  };
};

export const getBookingHistory = async (customerId: string) => {
  const store = await loadStore();
  return store.bookings
    .filter((booking) => booking.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getOwnerBookings = async (ownerId: string) => {
  const store = await loadStore();
  const ownerSalons = new Set(
    store.salons.filter((salon) => salon.ownerId === ownerId).map((salon) => salon.id)
  );
  return store.bookings.filter((booking) => ownerSalons.has(booking.salonId));
};

export const enrichBooking = async (booking: Booking) => {
  const store = await loadStore();
  const salon = store.salons.find((item) => item.id === booking.salonId);
  const service = store.services.find((item) => item.id === booking.serviceId);
  return { ...booking, salon, service } as Booking & {
    salon?: Salon;
    service?: Service;
  };
};