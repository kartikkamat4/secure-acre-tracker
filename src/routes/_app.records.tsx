import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { landRecords as seed, type LandRecord } from "@/lib/mock-data";
import { Pencil, Search, ShieldAlert, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-store";

export const Route = createFileRoute("/_app/records")({ component: RecordsPage });

function statusBadge(s: LandRecord["status"]) {
  if (s === "verified") return <Badge className="bg-success/15 text-success border-success/30">Verified</Badge>;
  if (s === "pending") return <Badge className="bg-warning/15 text-warning border-warning/30">Pending</Badge>;
  return <Badge variant="destructive" className="gap-1"><ShieldAlert className="size-3" />Flagged</Badge>;
}

function RecordsPage() {
  const session = useSession();
  const canEdit = session?.role === "admin" || session?.role === "auditor";
  const [rows, setRows] = useState<LandRecord[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<LandRecord | null>(null);

  const filtered = useMemo(() => rows.filter(r =>
    (status === "all" || r.status === status) &&
    (q === "" || [r.parcelId, r.owner, r.district, r.crop].join(" ").toLowerCase().includes(q.toLowerCase()))
  ), [rows, q, status]);

  function save(updated: LandRecord) {
    setRows(rs => rs.map(r => r.id === updated.id ? updated : r));
    setEditing(null);
    toast.success(`Record ${updated.id} updated`, { description: "Changes recorded in audit log." });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <CardTitle className="text-base font-display">Land Registry · {rows.length} parcels</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search parcel, owner, district..." className="pl-8 w-64" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              {canEdit && <Button size="sm"><Plus className="size-4" /> New record</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-mono text-[10px] uppercase">Parcel ID</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Owner</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">District</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Village</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right">Area (ha)</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Crop</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{r.parcelId}</TableCell>
                    <TableCell className="text-sm">{r.owner}</TableCell>
                    <TableCell className="text-sm">{r.district}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.village}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.areaHa.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{r.crop}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(r)} aria-label="edit">
                        <Pencil className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">No records match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          {editing && (
            <EditForm record={editing} onSave={save} canEdit={canEdit} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditForm({ record, onSave, canEdit }: { record: LandRecord; onSave: (r: LandRecord) => void; canEdit: boolean }) {
  const [r, setR] = useState(record);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display">Edit record · <span className="font-mono text-sm">{r.parcelId}</span></DialogTitle>
        <DialogDescription>All changes are signed and logged.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Owner</Label>
          <Input value={r.owner} onChange={e => setR({ ...r, owner: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>District</Label>
          <Input value={r.district} onChange={e => setR({ ...r, district: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>Village</Label>
          <Input value={r.village} onChange={e => setR({ ...r, village: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>Area (ha)</Label>
          <Input type="number" step="0.01" value={r.areaHa} onChange={e => setR({ ...r, areaHa: +e.target.value })} disabled={!canEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>Crop</Label>
          <Input value={r.crop} onChange={e => setR({ ...r, crop: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Status</Label>
          <Select value={r.status} onValueChange={(v) => setR({ ...r, status: v as LandRecord["status"] })} disabled={!canEdit}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {r.flagReason && (
          <div className="col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span><strong>Flag reason:</strong> {r.flagReason}</span>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={() => onSave({ ...r, lastUpdated: new Date().toISOString() })} disabled={!canEdit}>
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}
