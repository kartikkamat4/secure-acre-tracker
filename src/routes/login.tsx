import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { demoAccounts, setSession } from "@/lib/auth-store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gov.ke");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const acct = demoAccounts.find(a => a.email === email && a.password === password);
    if (!acct) {
      setErr("Invalid credentials. Try one of the demo accounts below.");
      setLoading(false);
      return;
    }
    setSession({ email: acct.email, role: acct.role, name: acct.name });
    toast.success(`Welcome, ${acct.name}`);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-sidebar text-sidebar-foreground p-10 flex-col justify-between">
        <div className="absolute inset-0 gov-grid-bg opacity-40" />
        <div className="absolute -bottom-32 -right-32 size-[420px] rounded-full bg-sidebar-primary/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-md bg-sidebar-primary/20 grid place-items-center ring-1 ring-sidebar-primary/40">
              <ShieldCheck className="size-6 text-sidebar-primary" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">LandGuard</div>
              <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">Secure National Registry</div>
            </div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <div className="text-[11px] uppercase tracking-widest text-sidebar-primary">Classified · Tier II</div>
          <h2 className="font-display text-3xl leading-tight">
            Tamper-evident land &amp; crop record management.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            End-to-end auditing, fraud detection, and role-based access for the Republic's
            agricultural land registry.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { k: "Parcels", v: "2.4M" },
              { k: "Audited", v: "99.7%" },
              { k: "Districts", v: "47" },
            ].map(s => (
              <div key={s.k} className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3">
                <div className="font-display text-xl">{s.v}</div>
                <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-[10px] text-sidebar-foreground/50 font-mono">
          SESSION-ID · {Math.random().toString(36).slice(2,10).toUpperCase()} · TLS 1.3 · MFA-READY
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/80">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <Lock className="size-3.5" /> Authorized personnel only
            </div>
            <CardTitle className="font-display text-2xl mt-1">Sign in</CardTitle>
            <CardDescription>Use your government-issued credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {err && <div className="text-xs text-destructive">{err}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Verifying..." : "Sign in securely"}
              </Button>
            </form>

            <div className="mt-6 border-t pt-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Demo accounts</div>
              <div className="grid gap-1.5 text-xs font-mono">
                {demoAccounts.map(a => (
                  <button key={a.email} type="button"
                    onClick={() => { setEmail(a.email); setPassword(a.password); }}
                    className="text-left px-2 py-1.5 rounded border bg-muted/40 hover:bg-muted transition">
                    <span className="text-accent">{a.role}</span> · {a.email} / {a.password}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
