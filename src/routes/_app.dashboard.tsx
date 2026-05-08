import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-store";
import { landRecords, alerts, suspiciousActivityWeek, alertTypeBreakdown, auditLog } from "@/lib/mock-data";
import { ShieldAlert, MapPinned, FileCheck2, Activity, ArrowUpRight } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const session = useSession();
  const verified = landRecords.filter(r => r.status === "verified").length;
  const flagged = landRecords.filter(r => r.status === "flagged").length;
  const pending = landRecords.filter(r => r.status === "pending").length;
  const openAlerts = alerts.filter(a => !a.resolved).length;

  const isFarmer = session?.role === "farmer";

  const kpis = isFarmer ? [
    { label: "My parcels", value: 4, icon: MapPinned, tone: "accent" },
    { label: "Verified", value: 3, icon: FileCheck2, tone: "success" },
    { label: "Pending review", value: 1, icon: Activity, tone: "warning" },
    { label: "Alerts on me", value: 0, icon: ShieldAlert, tone: "destructive" },
  ] : [
    { label: "Total parcels", value: landRecords.length, icon: MapPinned, tone: "accent" },
    { label: "Verified", value: verified, icon: FileCheck2, tone: "success" },
    { label: "Pending", value: pending, icon: Activity, tone: "warning" },
    { label: "Open alerts", value: openAlerts, icon: ShieldAlert, tone: "destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {isFarmer ? "Farmer console" : "Command overview"}
          </div>
          <h2 className="font-display text-2xl">Welcome, {session?.name}</h2>
        </div>
        <Badge variant="outline" className="font-mono text-[10px]">
          STATUS · OPERATIONAL · {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="relative overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-0.5 bg-${k.tone}`} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
                  <div className="font-display text-3xl mt-1">{k.value}</div>
                </div>
                <div className={`size-9 rounded-md grid place-items-center bg-${k.tone}/15 text-${k.tone}`}>
                  <k.icon className="size-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Suspicious activity · last 7 days</CardTitle>
            <CardDescription>Flags vs resolved by auditors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={suspiciousActivityWeek}>
                  <defs>
                    <linearGradient id="gFlag" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gRes" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                  <Area type="monotone" dataKey="flags" stroke="var(--color-destructive)" fill="url(#gFlag)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="var(--color-success)" fill="url(#gRes)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Alert types</CardTitle>
            <CardDescription>Distribution this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={alertTypeBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {alertTypeBreakdown.map((_, i) => (
                      <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District chart + recent activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Records by district</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={Object.entries(landRecords.reduce<Record<string, number>>((a, r) => { a[r.district] = (a[r.district] || 0) + 1; return a; }, {})).map(([name, count]) => ({ name, count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Recent activity</CardTitle>
            <Link to="/audit" className="text-xs text-accent inline-flex items-center gap-0.5 hover:underline">
              All <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {auditLog.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-2 text-xs border-b last:border-b-0 pb-2">
                <span className={`mt-1 size-1.5 rounded-full ${a.severity === "critical" ? "bg-destructive" : a.severity === "warn" ? "bg-warning" : "bg-accent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] truncate">{a.action} · {a.target}</div>
                  <div className="text-muted-foreground text-[11px] truncate">{a.actor}</div>
                </div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Open alerts */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-display">Top fraud alerts</CardTitle>
            <CardDescription>Unresolved · sorted by severity</CardDescription>
          </div>
          <Link to="/alerts" className="text-xs text-accent inline-flex items-center gap-0.5 hover:underline">
            View all <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {alerts.filter(a => !a.resolved).slice(0,4).map(a => (
            <div key={a.id} className="rounded-md border p-3 hover:bg-muted/40 transition">
              <div className="flex items-center justify-between mb-1">
                <Badge variant={a.severity === "critical" ? "destructive" : "outline"} className="capitalize text-[10px]">{a.severity}</Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{a.parcelId}</span>
              </div>
              <div className="text-sm font-medium">{a.title}</div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
