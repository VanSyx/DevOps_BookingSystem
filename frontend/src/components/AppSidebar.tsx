import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  CalendarCheck2,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bookings", url: "/bookings", icon: CalendarCheck2 },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Bookly</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Booking System
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.url === "/" ? path === "/" : path.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed ? (
          <div className="rounded-lg bg-accent/40 p-3">
            <p className="text-xs font-medium text-foreground">Pro tip</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              Press{" "}
              <kbd className="rounded bg-background px-1 py-0.5 text-[10px] font-mono shadow-sm border">
                ⌘K
              </kbd>{" "}
              to search anywhere.
            </p>
          </div>
        ) : (
          <div className="h-2" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
