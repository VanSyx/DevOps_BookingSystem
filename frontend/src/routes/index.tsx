import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, isToday, parseISO } from "date-fns";
import {
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { NewBookingDialog } from "@/components/NewBookingDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useBookings } from "@/store/bookings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bookly" },
      {
        name: "description",
        content: "Overview of bookings, today's schedule and key statistics.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const bookings = useBookings((s) => s.bookings);

  const stats = useMemo(() => {
    const total = bookings.length;
    const today = bookings.filter((b) => isToday(parseISO(b.date))).length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    return { total, today, pending, confirmed, cancelled };
  }, [bookings]);

  const chartData = useMemo(() => {
    const days: { day: string; bookings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, "yyyy-MM-dd");
      days.push({
        day: format(d, "EEE"),
        bookings: bookings.filter((b) => b.date === key).length,
      });
    }
    return days;
  }, [bookings]);

  const pieData = [
    { name: "Pending", value: stats.pending, color: "var(--warning)" },
    { name: "Confirmed", value: stats.confirmed, color: "var(--info)" },
    {
      name: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      color: "var(--success)",
    },
    { name: "Cancelled", value: stats.cancelled, color: "var(--destructive)" },
  ];

  const recent = bookings.slice(0, 5);
  const todayList = bookings
    .filter((b) => isToday(parseISO(b.date)))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back. Here's what's happening today, ${format(new Date(), "EEEE d MMM")}.`}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon={CalendarCheck2}
          tone="primary"
          trend="+12% vs last week"
          trendDir="up"
        />
        <StatCard
          label="Today"
          value={stats.today}
          icon={CalendarDays}
          tone="info"
          trend={`${todayList.length} scheduled`}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
          tone="warning"
          trend="Awaiting confirmation"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          tone="destructive"
          trend="-3% vs last week"
          trendDir="down"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Bookings overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link to="/bookings">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#bk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight">Status breakdown</h3>
          <p className="text-xs text-muted-foreground">All-time distribution</p>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={64}
                  paddingAngle={3}
                  stroke="none"
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Recent bookings</h3>
              <p className="text-xs text-muted-foreground">Latest activity from your customers</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/bookings">View all</Link>
            </Button>
          </div>
          <Separator />
          <ul className="divide-y">
            {recent.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.service} • {format(parseISO(b.date), "d MMM")} {b.time}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Today's schedule</h3>
            <span className="text-xs text-muted-foreground">{todayList.length} appts</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {todayList.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">No bookings today</p>
              </div>
            )}
            {todayList.map((b) => (
              <Link
                key={b.id}
                to="/bookings/$id"
                params={{ id: b.id }}
                className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex h-10 w-12 flex-col items-center justify-center rounded-md bg-primary/10 [color:var(--primary)]">
                  <span className="text-[10px] font-medium uppercase">{b.time.split(":")[0]}h</span>
                  <span className="text-[10px]">{b.time.split(":")[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.service}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <NewBookingDialog
              trigger={
                <Button size="sm" variant="outline" className="justify-start gap-2">
                  <Plus className="h-3.5 w-3.5" /> Booking
                </Button>
              }
            />
            <Button size="sm" variant="outline" className="justify-start gap-2" asChild>
              <Link to="/calendar">
                <CalendarDays className="h-3.5 w-3.5" /> Calendar
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="justify-start gap-2" asChild>
              <Link to="/bookings">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirm queue
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="justify-start gap-2" asChild>
              <Link to="/customers">
                <CalendarCheck2 className="h-3.5 w-3.5" /> Customers
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
