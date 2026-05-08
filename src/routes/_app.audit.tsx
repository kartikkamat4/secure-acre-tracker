import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditLog } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/audit")({ component: AuditPage });

function AuditPage() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");

  const rows = useMemo(() => auditLog.filter(a =>
    (sev === "all" || a.severity === sev) &&
    (q === "" || [a.actor, a.action, a.target, a.ip].join(" ").toLowerCase().includes(q.toLowerCase()))
  ), [q, sev]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <CardTitle className="text-base font-display">System audit log · {rows.length} events</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search actor, action, IP..." className="pl-8 w-64" />
            </div>
            <Select value={sev} onValueChange={setSev}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-mono text-[10px] uppercase">Timestamp</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Actor</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Role</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Action</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Target</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">IP</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(a => (
                <TableRow key={a.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {new Date(a.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{a.actor}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-[10px]">{a.role}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{a.action}</TableCell>
                  <TableCell className="font-mono text-xs">{a.target}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{a.ip}</TableCell>
                  <TableCell>
                    {a.severity === "critical" ? <Badge variant="destructive">Critical</Badge>
                      : a.severity === "warn" ? <Badge className="bg-warning/15 text-warning border-warning/30">Warning</Badge>
                      : <Badge variant="secondary">Info</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
