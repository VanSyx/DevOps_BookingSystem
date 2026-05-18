import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import type { Booking, BookingStatus } from "@/types/booking";

const SERVICES = [
  "Hair Cut",
  "Spa Treatment",
  "Dental Checkup",
  "Consulting Session",
  "Massage Therapy",
  "Skin Care",
];

type NewBooking = Omit<Booking, "id" | "createdAt" | "status"> & {
  status?: BookingStatus;
};

interface BookingStore {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  load: () => Promise<void>;
  add: (b: NewBooking) => Promise<Booking>;
  update: (id: string, patch: Partial<Booking>) => Promise<Booking>;
  remove: (id: string) => Promise<void>;
  setStatus: (id: string, status: BookingStatus) => Promise<Booking>;
}

function sortBookings(bookings: Booking[]) {
  return [...bookings].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
}

function toApiPayload(booking: Partial<Booking>) {
  return {
    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    notes: booking.notes,
  };
}

export const useBookings = create<BookingStore>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,
  loaded: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const bookings = (await apiFetch("/bookings")) as Booking[];
      set({ bookings: sortBookings(bookings), loading: false, loaded: true });
    } catch (error) {
      set({
        loading: false,
        loaded: true,
        error: error instanceof Error ? error.message : "Could not load bookings",
      });
    }
  },

  add: async (b) => {
    const created = (await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify(toApiPayload(b)),
    })) as Booking;

    set({ bookings: sortBookings([created, ...get().bookings]) });
    return created;
  },

  update: async (id, patch) => {
    const updated = (await apiFetch(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toApiPayload(patch)),
    })) as Booking;

    set({
      bookings: sortBookings(get().bookings.map((b) => (b.id === id ? updated : b))),
    });
    return updated;
  },

  remove: async (id) => {
    await apiFetch(`/bookings/${id}`, { method: "DELETE" });
    set({ bookings: get().bookings.filter((b) => b.id !== id) });
  },

  setStatus: async (id, status) => {
    const updated = (await apiFetch(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })) as Booking;

    set({
      bookings: sortBookings(get().bookings.map((b) => (b.id === id ? updated : b))),
    });
    return updated;
  },
}));

export const SERVICE_OPTIONS = SERVICES;
