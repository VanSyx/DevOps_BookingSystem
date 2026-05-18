import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Bookly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Configure your workspace, notifications and integrations."
      />

      <Card className="p-6">
        <h2 className="text-base font-semibold">Workspace</h2>
        <p className="text-xs text-muted-foreground">Public details about your booking page.</p>
        <Separator className="my-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Workspace name</Label>
            <Input defaultValue="Bookly Studio" />
          </div>
          <div className="grid gap-1.5">
            <Label>Support email</Label>
            <Input defaultValue="hello@bookly.app" />
          </div>
          <div className="grid gap-1.5">
            <Label>Timezone</Label>
            <Input defaultValue="Asia/Ho_Chi_Minh" />
          </div>
          <div className="grid gap-1.5">
            <Label>Booking slot (min)</Label>
            <Input type="number" defaultValue={30} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Notifications</h2>
        <p className="text-xs text-muted-foreground">
          Choose what you'd like to be notified about.
        </p>
        <Separator className="my-4" />
        <div className="space-y-4">
          <Row title="New bookings" description="Get an email when a customer creates a booking." />
          <Row title="Cancellations" description="Notify me when a booking is cancelled." />
          <Row
            title="Daily digest"
            description="A summary of tomorrow's schedule sent every evening."
            defaultChecked={false}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}

function Row({
  title,
  description,
  defaultChecked = true,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3.5">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
