export type LandRecord = {
  id: string;
  parcelId: string;
  owner: string;
  district: string;
  village: string;
  areaHa: number;
  crop: string;
  status: "verified" | "pending" | "flagged";
  lastUpdated: string;
  flagReason?: string;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  actor: string;
  role: "farmer" | "admin" | "system";
  action: string;
  target: string;
  ip: string;
  severity: "info" | "warn" | "critical";
};

export type Alert = {
  id: string;
  timestamp: string;
  type: "duplicate_parcel" | "ownership_change" | "area_mismatch" | "geo_anomaly" | "rapid_edits";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  parcelId: string;
  resolved: boolean;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "admin" | "auditor";
  status: "active" | "suspended";
  district: string;
  lastLogin: string;
};

const districts = ["Nakuru", "Kisumu", "Meru", "Nyeri", "Kakamega", "Machakos"];
const crops = ["Maize", "Wheat", "Tea", "Coffee", "Rice", "Sorghum", "Beans"];
const villages = ["Mwanzo", "Kilima", "Mtaa", "Shamba", "Bonde", "Mlima"];

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

export const landRecords: LandRecord[] = Array.from({ length: 42 }, (_, i) => {
  const r = Math.random();
  const status: LandRecord["status"] = r < 0.12 ? "flagged" : r < 0.28 ? "pending" : "verified";
  return {
    id: `LR-${10000 + i}`,
    parcelId: `KE/${rand(districts).slice(0,3).toUpperCase()}/${1000 + i}`,
    owner: ["John Mwangi","Grace Otieno","Samuel Kiprop","Mary Wanjiku","Peter Kamau","Aisha Hassan","David Onyango","Faith Njeri"][i % 8],
    district: rand(districts),
    village: rand(villages),
    areaHa: +(0.3 + Math.random() * 12).toFixed(2),
    crop: rand(crops),
    status,
    lastUpdated: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60).toISOString(),
    flagReason: status === "flagged" ? rand(["Duplicate parcel claim","Area mismatch with cadastral map","Recent ownership transfer","Geo-coordinates outside district"]) : undefined,
  };
});

export const auditLog: AuditEntry[] = Array.from({ length: 60 }, (_, i) => {
  const sev = Math.random();
  return {
    id: `AU-${20000 + i}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 37).toISOString(),
    actor: ["admin@gov.ke","j.mwangi@farm.ke","auditor@gov.ke","g.otieno@farm.ke","system"][i % 5],
    role: (["admin","farmer","auditor","farmer","system"] as const)[i % 5] as AuditEntry["role"],
    action: rand(["LOGIN","UPDATE_RECORD","CREATE_RECORD","DELETE_RECORD","EXPORT_DATA","FLAG_RECORD","VERIFY_RECORD","FAILED_LOGIN","PERMISSION_CHANGE"]),
    target: `LR-${10000 + Math.floor(Math.random() * 42)}`,
    ip: `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
    severity: sev < 0.08 ? "critical" : sev < 0.25 ? "warn" : "info",
  };
});

export const alerts: Alert[] = [
  { id: "AL-001", timestamp: new Date(Date.now()-1000*60*12).toISOString(), type: "duplicate_parcel", severity: "critical", title: "Duplicate parcel registration", description: "Parcel KE/NAK/1042 registered by two distinct owners within 48h.", parcelId: "KE/NAK/1042", resolved: false },
  { id: "AL-002", timestamp: new Date(Date.now()-1000*60*55).toISOString(), type: "rapid_edits", severity: "high", title: "Rapid edit pattern detected", description: "12 edits to LR-10023 in past hour from 3 distinct IPs.", parcelId: "KE/KIS/1023", resolved: false },
  { id: "AL-003", timestamp: new Date(Date.now()-1000*60*60*3).toISOString(), type: "area_mismatch", severity: "medium", title: "Declared area exceeds cadastral", description: "Declared 8.4 ha vs registered 5.1 ha.", parcelId: "KE/MER/1018", resolved: false },
  { id: "AL-004", timestamp: new Date(Date.now()-1000*60*60*8).toISOString(), type: "geo_anomaly", severity: "high", title: "Geo-coordinates anomaly", description: "Submitted GPS lies 47 km outside declared district.", parcelId: "KE/NYE/1031", resolved: false },
  { id: "AL-005", timestamp: new Date(Date.now()-1000*60*60*22).toISOString(), type: "ownership_change", severity: "low", title: "Ownership transfer pending review", description: "Routine transfer awaiting auditor sign-off.", parcelId: "KE/KAK/1009", resolved: true },
  { id: "AL-006", timestamp: new Date(Date.now()-1000*60*60*30).toISOString(), type: "duplicate_parcel", severity: "critical", title: "Conflicting boundaries", description: "Polygon overlap of 62% with neighbouring parcel.", parcelId: "KE/MAC/1027", resolved: false },
];

export const users: AppUser[] = [
  { id: "U-001", name: "Admin Office", email: "admin@gov.ke", role: "admin", status: "active", district: "HQ Nairobi", lastLogin: new Date(Date.now()-1000*60*4).toISOString() },
  { id: "U-002", name: "John Mwangi", email: "j.mwangi@farm.ke", role: "farmer", status: "active", district: "Nakuru", lastLogin: new Date(Date.now()-1000*60*60*2).toISOString() },
  { id: "U-003", name: "Grace Otieno", email: "g.otieno@farm.ke", role: "farmer", status: "active", district: "Kisumu", lastLogin: new Date(Date.now()-1000*60*60*5).toISOString() },
  { id: "U-004", name: "Samuel Kiprop", email: "s.kiprop@farm.ke", role: "farmer", status: "suspended", district: "Meru", lastLogin: new Date(Date.now()-1000*60*60*48).toISOString() },
  { id: "U-005", name: "Mary Wanjiku", email: "m.wanjiku@farm.ke", role: "farmer", status: "active", district: "Nyeri", lastLogin: new Date(Date.now()-1000*60*60*9).toISOString() },
  { id: "U-006", name: "Internal Auditor", email: "auditor@gov.ke", role: "auditor", status: "active", district: "HQ Nairobi", lastLogin: new Date(Date.now()-1000*60*30).toISOString() },
  { id: "U-007", name: "Peter Kamau", email: "p.kamau@farm.ke", role: "farmer", status: "active", district: "Kakamega", lastLogin: new Date(Date.now()-1000*60*60*14).toISOString() },
  { id: "U-008", name: "Aisha Hassan", email: "a.hassan@farm.ke", role: "farmer", status: "active", district: "Machakos", lastLogin: new Date(Date.now()-1000*60*60*1).toISOString() },
];

// Charts
export const suspiciousActivityWeek = [
  { day: "Mon", flags: 3, resolved: 2 },
  { day: "Tue", flags: 5, resolved: 4 },
  { day: "Wed", flags: 8, resolved: 5 },
  { day: "Thu", flags: 6, resolved: 6 },
  { day: "Fri", flags: 11, resolved: 7 },
  { day: "Sat", flags: 4, resolved: 4 },
  { day: "Sun", flags: 2, resolved: 1 },
];

export const alertTypeBreakdown = [
  { name: "Duplicate", value: 12, key: "duplicate_parcel" },
  { name: "Area mismatch", value: 8, key: "area_mismatch" },
  { name: "Geo anomaly", value: 5, key: "geo_anomaly" },
  { name: "Rapid edits", value: 7, key: "rapid_edits" },
  { name: "Ownership", value: 4, key: "ownership_change" },
];
