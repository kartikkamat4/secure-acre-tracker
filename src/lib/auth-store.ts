// Lightweight client-side mock auth (demo only — not real security).
import { useEffect, useState } from "react";

export type Session = { email: string; role: "admin" | "farmer" | "auditor"; name: string } | null;

const KEY = "gov_land_session";

export function getSession(): Session {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function setSession(s: Session) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("session-change"));
}

export function useSession(): Session {
  const [s, setS] = useState<Session>(() => getSession());
  useEffect(() => {
    const h = () => setS(getSession());
    window.addEventListener("session-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("session-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
}

// Demo accounts
export const demoAccounts = [
  { email: "admin@gov.ke", password: "admin123", role: "admin" as const, name: "Admin Office" },
  { email: "farmer@farm.ke", password: "farmer123", role: "farmer" as const, name: "John Mwangi" },
  { email: "auditor@gov.ke", password: "audit123", role: "auditor" as const, name: "Internal Auditor" },
];
