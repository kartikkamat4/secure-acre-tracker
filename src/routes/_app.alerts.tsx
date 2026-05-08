import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts as seed, alertTypeBreakdown, suspiciousActivityWeek, type Alert } from "@/lib/mock-data";
import { ShieldAlert, ShieldCheck, AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_app/alerts")({ component: AlertsPage });

const sevColor: Record<Alert["severity"], string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-accent/15 text-accent border-accent/30",
  high: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-destructive/15 text-destructive border-destructive/40",
};

function AlertsPage() {
  const [items, setItems] = useState<Alert[]>(seed);
  const open = items.filter(a => !a.resolved);

  function resolve(id: string) {
    setItems(xs => xs.map(a => a.id === id ? { ...a, resolved: true } : a));
    toast.success("Alert resolved", { description: "Status updated and audit entry created." });
  }

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Fraud signal · 7-day trend</CardTitle>
            <CardDescription>Detection volume across all districts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={suspiciousActivityWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="flags" fill="var(--color-destructive)" radius={[4,4,0,0]} />
                  <Bar dataKey="resolved" fill="var(--color-success)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Open by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertTypeBreakdown.map(t => (
              <div key={t.key} className="flex items-center justify-between text-sm">
                <span>{t.name}</span>
                <Badge variant="outline" className="font-mono">{t.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 text-destructive" />
        <h3 className="font-display text-lg">Open alerts <span className="text-muted-foreground font-sans text-sm">· {open.length}</span></h3>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {items.map(a => (
          <Card key={a.id} className={`relative overflow-hidden ${a.resolved ? "opacity-60" : ""}`}>
            <div className={`absolute inset-y-0 left-0 w-1 ${a.severity === "critical" ? "bg-destructive" : a.severity === "high" ? "bg-warning" : a.severity === "medium" ? "bg-accent" : "bg-muted"}`} />
            <CardContent className="p-4 pl-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-muted-foreground" />
                  <Badge variant="outline" className={`capitalize text-[10px] ${sevColor[a.severity]}`}>{a.severity}</Badge>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.type.replace("_", " ")}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 font-medium">{a.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <MapPin className="size-3" /> {a.parcelId}
                </div>
                {a.resolved ? (
                  <Badge className="bg-success/15 text-success border-success/30 gap-1"><ShieldCheck className="size-3" />Resolved</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => resolve(a.id)}>
                    Mark resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
