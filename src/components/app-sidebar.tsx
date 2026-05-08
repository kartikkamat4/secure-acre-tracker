import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, MapPinned, ScrollText, ShieldAlert, Users, LogOut, ShieldCheck } from "lucide-react";
import { useSession, setSession } from "@/lib/auth-store";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin","farmer","auditor"] },
  { title: "Land Records", url: "/records", icon: MapPinned, roles: ["admin","farmer","auditor"] },
  { title: "Audit Logs", url: "/audit", icon: ScrollText, roles: ["admin","auditor"] },
  { title: "Alerts", url: "/alerts", icon: ShieldAlert, roles: ["admin","auditor"] },
  { title: "User Management", url: "/users", icon: Users, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: r => r.location.pathname });
  const session = useSession();
  const navigate = useNavigate();

  const role = session?.role ?? "farmer";
  const visible = items.filter(i => i.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="size-9 rounded-md bg-sidebar-primary/15 grid place-items-center ring-1 ring-sidebar-primary/40">
            <ShieldCheck className="size-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-semibold text-sidebar-foreground">LandGuard</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Gov · Secure Registry</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map(item => {
                const active = path === item.url || path.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && session && (
          <div className="px-2 py-2 text-xs">
            <div className="text-sidebar-foreground font-medium truncate">{session.name}</div>
            <div className="text-sidebar-foreground/60 truncate">{session.email}</div>
            <Badge variant="secondary" className="mt-1 capitalize">{session.role}</Badge>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => { setSession(null); navigate({ to: "/login" }); }}>
              <LogOut className="size-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
