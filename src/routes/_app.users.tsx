import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users as seed, type AppUser } from "@/lib/mock-data";
import { Search, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(seed);
  const [q, setQ] = useState("");

  const rows = users.filter(u => [u.name, u.email, u.district, u.role].join(" ").toLowerCase().includes(q.toLowerCase()));

  function toggle(u: AppUser) {
    setUsers(us => us.map(x => x.id === u.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x));
    toast.success(`${u.name} ${u.status === "active" ? "suspended" : "reactivated"}`);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <CardTitle className="text-base font-display">Users · {users.length}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..." className="pl-8 w-64" />
            </div>
            <Button size="sm"><UserPlus className="size-4" /> Invite user</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-mono text-[10px] uppercase">User</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Role</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">District</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                <TableHead className="font-mono text-[10px] uppercase">Last login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(u => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-[11px] bg-accent/15 text-accent">{u.name.split(" ").map(s => s[0]).join("").slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize gap-1">
                      {u.role === "admin" && <Shield className="size-3 text-accent" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{u.district}</TableCell>
                  <TableCell>
                    {u.status === "active"
                      ? <Badge className="bg-success/15 text-success border-success/30">Active</Badge>
                      : <Badge variant="destructive">Suspended</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(u.lastLogin).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggle(u)}>
                      {u.status === "active" ? "Suspend" : "Reactivate"}
                    </Button>
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
