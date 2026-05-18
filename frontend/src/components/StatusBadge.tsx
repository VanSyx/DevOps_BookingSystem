import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30 [color:var(--warning)]",
  confirmed: "bg-info/15 border-info/30 [color:var(--info)]",
  completed: "bg-success/15 border-success/30 [color:var(--success)]",
  cancelled: "bg-destructive/15 border-destructive/30 [color:var(--destructive)]",
};

const LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </Badge>
  );
}
