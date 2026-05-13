import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendDir?: "up" | "down";
  tone?: "primary" | "success" | "warning" | "destructive" | "info";
}

const TONES: Record<
  NonNullable<StatCardProps["tone"]>,
  { ring: string; bg: string; text: string }
> = {
  primary: { ring: "ring-primary/20", bg: "bg-primary/10", text: "[color:var(--primary)]" },
  success: { ring: "ring-success/20", bg: "bg-success/10", text: "[color:var(--success)]" },
  warning: { ring: "ring-warning/20", bg: "bg-warning/10", text: "[color:var(--warning)]" },
  destructive: {
    ring: "ring-destructive/20",
    bg: "bg-destructive/10",
    text: "[color:var(--destructive)]",
  },
  info: { ring: "ring-info/20", bg: "bg-info/10", text: "[color:var(--info)]" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDir,
  tone = "primary",
}: StatCardProps) {
  const t = TONES[tone];
  return (
    <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trendDir === "down" ? "[color:var(--destructive)]" : "[color:var(--success)]",
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110",
            t.bg,
            t.ring,
          )}
        >
          <Icon className={cn("h-5 w-5", t.text)} />
        </div>
      </div>
    </Card>
  );
}
