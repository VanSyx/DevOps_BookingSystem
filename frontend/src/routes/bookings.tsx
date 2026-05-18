import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Search,
  Filter,
  CalendarIcon,
  Plus,
  Eye,
  CheckCircle2,
  CheckCheck,
  XCircle,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { NewBookingDialog } from "@/components/NewBookingDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { SERVICE_OPTIONS, useBookings } from "@/store/bookings";
import type { BookingStatus } from "@/types/booking";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Bookly" },
      {
        name: "description",
        content: "Manage all bookings: search, filter, confirm, cancel and more.",
      },
    ],
  }),
  component: BookingsPage,
});

const TABS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function canMoveTo(status: BookingStatus, next: BookingStatus) {
  if (status === "pending") return next === "confirmed" || next === "cancelled";
  if (status === "confirmed") return next === "completed" || next === "cancelled";
  return false;
}

function BookingsPage() {
  const bookings = useBookings((s) => s.bookings);
  const setStatus = useBookings((s) => s.setStatus);
  const remove = useBookings((s) => s.remove);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<BookingStatus | "all">("all");
  const [date, setDate] = useState<Date | undefined>();
  const [service, setService] = useState("all");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const moreFilterCount = [service !== "all", Boolean(startTime), Boolean(endTime)].filter(
    Boolean,
  ).length;

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (date && b.date !== format(date, "yyyy-MM-dd")) return false;
      if (service !== "all" && b.service !== service) return false;
      if (startTime && b.time < startTime) return false;
      if (endTime && b.time > endTime) return false;
      if (q) {
        const t = q.toLowerCase();
        if (
          !b.customerName.toLowerCase().includes(t) &&
          !b.phone.toLowerCase().includes(t) &&
          !b.email.toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [bookings, q, tab, date, service, startTime, endTime]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const s of ["pending", "confirmed", "completed", "cancelled"] as const) {
      c[s] = bookings.filter((b) => b.status === s).length;
    }
    return c;
  }, [bookings]);

  const changeStatus = async (id: string, status: BookingStatus, successMessage: string) => {
    try {
      await setStatus(id, status);
      toast.success(successMessage);
    } catch (error) {
      toast.error("Status update blocked", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await remove(id);
      toast("Booking deleted");
    } catch (error) {
      toast.error("Could not delete booking", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Bookings"
        description="Search, filter and manage every appointment in one place."
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

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, phone, email…"
              className="h-9 pl-8"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("gap-1.5", date && "[color:var(--primary)] border-primary/40")}
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "PPP") : "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setDate(undefined)}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5",
                  moreFilterCount > 0 && "[color:var(--primary)] border-primary/40",
                )}
              >
                <Filter className="h-4 w-4" />
                More filters
                {moreFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {moreFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">More filters</h3>
                <p className="text-xs text-muted-foreground">
                  Narrow bookings by service and time.
                </p>
              </div>
              <Separator className="my-3" />
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All services</SelectItem>
                      {SERVICE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">From</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">To</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start px-0"
                  onClick={() => {
                    setService("all");
                    setStartTime("");
                    setEndTime("");
                  }}
                >
                  Clear more filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {bookings.length} bookings
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as BookingStatus | "all")}
          className="mt-4"
        >
          <TabsList className="h-auto bg-transparent p-0 border-b w-full justify-start rounded-none gap-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:[color:var(--primary)] rounded-none px-3 py-2 text-sm"
              >
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {counts[t.value] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & time</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No bookings match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((b) => (
                <TableRow key={b.id} className="group">
                  <TableCell>
                    <Link
                      to="/bookings/$id"
                      params={{ id: b.id }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                          {b.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">{b.customerName}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{b.service}</TableCell>
                  <TableCell>
                    <div className="text-sm">{format(parseISO(b.date), "d MMM yyyy")}</div>
                    <div className="text-xs text-muted-foreground">{b.time}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{b.phone}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onView={() => {}}
                      id={b.id}
                      status={b.status}
                      onConfirm={() => changeStatus(b.id, "confirmed", "Booking confirmed")}
                      onCancel={() => changeStatus(b.id, "cancelled", "Booking cancelled")}
                      onComplete={() => changeStatus(b.id, "completed", "Booking completed")}
                      onDelete={() => deleteBooking(b.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y md:hidden">
          {filtered.map((b) => (
            <li key={b.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {b.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link to="/bookings/$id" params={{ id: b.id }} className="truncate font-medium">
                      {b.customerName}
                    </Link>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.service} • {format(parseISO(b.date), "d MMM")} {b.time}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{b.phone}</p>
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-12 text-center text-sm text-muted-foreground">
              No bookings match your filters.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function RowActions({
  id,
  status,
  onConfirm,
  onCancel,
  onComplete,
  onDelete,
}: {
  id: string;
  status: BookingStatus;
  onView: () => void;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onComplete: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
        <Link to="/bookings/$id" params={{ id }}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      {canMoveTo(status, "confirmed") && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 [color:var(--success)]"
          onClick={onConfirm}
          title="Confirm"
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
      {canMoveTo(status, "cancelled") && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 [color:var(--destructive)]"
          onClick={onCancel}
          title="Cancel"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
      {canMoveTo(status, "completed") && (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 [color:var(--success)]"
          onClick={onComplete}
          title="Complete"
        >
          <CheckCheck className="h-4 w-4" />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/bookings/$id" params={{ id }}>
              View details
            </Link>
          </DropdownMenuItem>
          {canMoveTo(status, "confirmed") && (
            <DropdownMenuItem onClick={onConfirm}>Mark confirmed</DropdownMenuItem>
          )}
          {canMoveTo(status, "completed") && (
            <DropdownMenuItem onClick={onComplete}>Mark completed</DropdownMenuItem>
          )}
          {canMoveTo(status, "cancelled") && (
            <DropdownMenuItem onClick={onCancel}>Mark cancelled</DropdownMenuItem>
          )}
          {(canMoveTo(status, "confirmed") ||
            canMoveTo(status, "completed") ||
            canMoveTo(status, "cancelled")) && <DropdownMenuSeparator />}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="[color:var(--destructive)]"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The booking record will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
