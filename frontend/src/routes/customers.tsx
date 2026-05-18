import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Mail, Phone } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBookings } from "@/store/bookings";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Bookly" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const bookings = useBookings((s) => s.bookings);
  const [q, setQ] = useState("");

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; phone: string; email: string; total: number; lastBooking: string }
    >();
    for (const b of bookings) {
      const key = b.email || `phone:${b.phone}`;
      const existing = map.get(key);
      if (existing) {
        existing.total += 1;
        if (b.date > existing.lastBooking) existing.lastBooking = b.date;
      } else {
        map.set(key, {
          name: b.customerName,
          phone: b.phone,
          email: b.email,
          total: 1,
          lastBooking: b.date,
        });
      }
    }
    return Array.from(map.values()).filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q.toLowerCase()),
    );
  }, [bookings, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Customers" description="Everyone who's booked an appointment with you." />

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers…"
            className="h-9 pl-8"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <Card key={c.email} className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <Badge variant="secondary" className="mt-0.5 rounded-full text-[10px]">
                  {c.total} booking{c.total > 1 && "s"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span className="font-mono">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{c.email}</span>
              </div>
            </div>
          </Card>
        ))}
        {customers.length === 0 && (
          <Card className="col-span-full p-12 text-center text-sm text-muted-foreground">
            No customers found.
          </Card>
        )}
      </div>
    </div>
  );
}
