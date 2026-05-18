import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
  Clock3,
  FileText,
  CheckCircle2,
  CheckCheck,
  XCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { useBookings } from "@/store/bookings";
import type { BookingStatus } from "@/types/booking";

export const Route = createFileRoute("/bookings_/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Booking ${params.id} — Bookly` }],
  }),
  component: BookingDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Booking not found.</div>
  ),
});

function canMoveTo(status: BookingStatus, next: BookingStatus) {
  if (status === "pending") return next === "confirmed" || next === "cancelled";
  if (status === "confirmed") return next === "completed" || next === "cancelled";
  return false;
}

function BookingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const booking = useBookings((s) => s.bookings.find((b) => b.id === id));
  const setStatus = useBookings((s) => s.setStatus);
  const remove = useBookings((s) => s.remove);

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-sm text-muted-foreground">This booking no longer exists.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  const timeline = [
    { label: "Booking created", at: booking.createdAt },
    booking.status !== "pending" && {
      label: `Status changed to ${booking.status}`,
      at: new Date().toISOString(),
    },
  ].filter(Boolean) as { label: string; at: string }[];

  const changeStatus = async (status: BookingStatus, successMessage: string) => {
    try {
      await setStatus(booking.id, status);
      toast.success(successMessage);
    } catch (error) {
      toast.error("Status update blocked", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const deleteBooking = async () => {
    try {
      await remove(booking.id);
      toast("Deleted");
      navigate({ to: "/bookings" });
    } catch (error) {
      toast.error("Could not delete booking", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/bookings">
            <ArrowLeft className="h-4 w-4" /> All bookings
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {canMoveTo(booking.status, "confirmed") && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => changeStatus("confirmed", "Confirmed")}
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm
            </Button>
          )}
          {canMoveTo(booking.status, "cancelled") && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => changeStatus("cancelled", "Cancelled")}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          )}
          {canMoveTo(booking.status, "completed") && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => changeStatus("completed", "Completed")}
            >
              <CheckCheck className="h-4 w-4" /> Complete
            </Button>
          )}
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={deleteBooking}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="space-y-6 lg:w-2/3">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                    {booking.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">{booking.customerName}</h1>
                  <p className="text-xs text-muted-foreground">
                    Booking <span className="font-mono">{booking.id}</span>
                  </p>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <Separator className="my-6" />

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field icon={Phone} label="Phone" value={booking.phone} />
              <Field icon={Mail} label="Email" value={booking.email} />
              <Field
                icon={CalendarDays}
                label="Date"
                value={format(parseISO(booking.date), "PPP")}
              />
              <Field icon={Clock3} label="Time" value={booking.time} />
              <Field icon={FileText} label="Service" value={booking.service} />
              <Field
                icon={FileText}
                label="Created"
                value={format(parseISO(booking.createdAt), "PPp")}
              />
            </dl>

            {booking.notes && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <p className="mt-1.5 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {booking.notes}
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:w-1/3">
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Status timeline</h3>
            <ol className="mt-4 space-y-4">
              {timeline.map((t, i) => (
                <li key={i} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
                  {i !== timeline.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
                  )}
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(t.at), "PPp")}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Activity log</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <p>Booking record created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(booking.createdAt), "PPp")}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <div>
                  <p>Confirmation email queued</p>
                  <p className="text-xs text-muted-foreground">A few moments later</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
      </div>
    </div>
  );
}
