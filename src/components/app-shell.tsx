import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useSession } from "@/lib/auth-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { alerts as initialAlerts } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function AppShell() {
  const { theme, toggle } = useTheme();
  const session = useSession();
  const navigate = useNavigate();
  const path = useRouterState({ select: r => r.location.pathname });
  const [unread, setUnread] = useState(initialAlerts.filter(a => !a.resolved).length);

  useEffect(() => {
    if (!session) navigate({ to: "/login" });
  }, [session, navigate]);

  // Simulated incoming notification
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => {
      toast.warning("Suspicious activity detected", {
        description: "Rapid edits on parcel KE/KIS/1023 — review now.",
      });
      setUnread(u => u + 1);
    }, 6000);
    return () => clearTimeout(t);
  }, [session]);

  if (!session) return null;

  const title = ({
    "/dashboard": "Operations Dashboard",
    "/records": "Land Records",
    "/audit": "Audit Logs",
    "/alerts": "Fraud Alerts",
    "/users": "User Management",
  } as Record<string, string>)[path] ?? "LandGuard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/50 backdrop-blur px-3 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger />
              <div className="hidden sm:block h-5 w-px bg-border mx-1" />
              <div className="min-w-0">
                <h1 className="text-sm font-display font-semibold truncate">{title}</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
                  Republic Land & Crop Registry
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell unread={unread} onOpen={() => setUnread(0)} />
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="toggle theme">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function NotificationBell({ unread, onOpen }: { unread: number; onOpen: () => void }) {
  const items = initialAlerts.slice(0, 5);
  return (
    <Popover onOpenChange={(o) => o && onOpen()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <div className="text-sm font-medium">Notifications</div>
          <Badge variant="outline">{unread} new</Badge>
        </div>
        <div className="max-h-80 overflow-auto divide-y">
          {items.map(a => (
            <div key={a.id} className="px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "high" ? "bg-warning" : "bg-accent"}`} />
                <span className="text-xs font-medium truncate">{a.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">{a.parcelId}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
