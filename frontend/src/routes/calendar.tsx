import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { NewBookingDialog } from "@/components/NewBookingDialog";
import { useBookings } from "@/store/bookings";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Bookly" }] }),
  component: CalendarPage,
});

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "bg-warning",
  confirmed: "bg-info",
  completed: "bg-success",
  cancelled: "bg-destructive",
};

function CalendarPage() {
  const bookings = useBookings((s) => s.bookings);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map: Record<string, typeof bookings> = {};
    for (const b of bookings) {
      (map[b.date] ||= []).push(b);
    }
    return map;
  }, [bookings]);

  const selectedList = (byDay[format(selected, "yyyy-MM-dd")] ?? []).sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Calendar"
        description="Visualize your bookings across the month."
        actions={
          <NewBookingDialog
            trigger={
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> New Booking
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{format(cursor, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCursor(subMonths(cursor, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCursor(new Date());
                  setSelected(new Date());
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCursor(addMonths(cursor, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const items = byDay[format(d, "yyyy-MM-dd")] ?? [];
              const inMonth = isSameMonth(d, cursor);
              const isSelected = isSameDay(d, selected);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={cn(
                    "group relative flex aspect-square min-h-[72px] flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-all",
                    inMonth
                      ? "bg-background hover:bg-muted/40"
                      : "bg-muted/20 text-muted-foreground/60",
                    isSelected && "border-primary ring-2 ring-primary/30",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isSameDay(d, new Date()) &&
                        "rounded-full bg-primary px-1.5 text-primary-foreground",
                    )}
                  >
                    {format(d, "d")}
                  </span>
                  <div className="mt-auto flex w-full flex-wrap gap-0.5">
                    {items.slice(0, 4).map((b) => (
                      <span
                        key={b.id}
                        className={cn("h-1.5 w-1.5 rounded-full", STATUS_COLOR[b.status])}
                      />
                    ))}
                    {items.length > 4 && (
                      <span className="text-[9px] text-muted-foreground">+{items.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", STATUS_COLOR[s])} />
                <span className="capitalize">{s}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight">
            {format(selected, "EEEE, d MMMM")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedList.length} booking{selectedList.length !== 1 && "s"}
          </p>

          <div className="mt-4 space-y-2">
            {selectedList.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                Nothing scheduled for this day.
              </div>
            )}
            {selectedList.map((b) => (
              <Link
                key={b.id}
                to="/bookings/$id"
                params={{ id: b.id }}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-10 w-12 flex-col items-center justify-center rounded-md bg-primary/10 [color:var(--primary)]">
                  <span className="text-[11px] font-semibold">{b.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.service}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
