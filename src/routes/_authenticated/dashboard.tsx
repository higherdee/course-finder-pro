import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Bot, FileStack, LayoutDashboard, Loader2, Shield, Upload, Wallet } from "lucide-react";
import { useEffect } from "react";

import { AppShell, type NavItem } from "@/components/app-shell";
import { useIsAdmin, useProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Syllaboss" },
      { name: "description", content: "Upload materials, earn points and study with your AI assistant." },
      { property: "og:title", content: "Dashboard — Syllaboss" },
      { property: "og:description", content: "Your Syllaboss student dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardLayout,
});

const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/upload", label: "Upload material", icon: Upload },
  { to: "/dashboard/materials", label: "My uploads", icon: FileStack },
  { to: "/dashboard/wallet", label: "Points & cash out", icon: Wallet },
  { to: "/dashboard/assistant", label: "AI study assistant", icon: Bot },
];

function DashboardLayout() {
  const { data: profile, isLoading } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.onboarding_step < 3) navigate({ to: "/onboarding" });
  }, [profile, navigate]);

  if (isLoading || !profile || profile.onboarding_step < 3) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <AppShell
      nav={nav}
      title="Student"
      footer={
        isAdmin ? (
          <a href="/admin" className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">
            <Shield className="size-4 text-primary" /> Admin dashboard
          </a>
        ) : null
      }
    >
      <Outlet />
    </AppShell>
  );
}
