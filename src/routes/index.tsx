import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const s = typeof window !== "undefined" ? getSession() : null;
    throw redirect({ to: s ? "/dashboard" : "/login" });
  },
  component: () => null,
});
