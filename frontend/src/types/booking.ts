export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  bookingId: string;
  message: string;
  at: string;
}
