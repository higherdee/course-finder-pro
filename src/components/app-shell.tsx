import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { SyllabossLogo } from "@/components/syllaboss-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

export function AppShell({ nav, title, footer, children }: { nav: NavItem[]; title: string; footer?: ReactNode; children: ReactNode }) {
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? "Student";

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const side = (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-2"><SyllabossLogo /></div>
      <p className="px-3 font-mono text-[10px] uppercase text-muted-foreground">{title}</p>
      {links}
      <div className="mt-auto space-y-3">
        {footer}
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Sign out" onClick={signOut}><LogOut /></Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-card lg:block">{side}</aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <SyllabossLogo />
        <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen((o) => !o)}>{open ? <X /> : <Menu />}</Button>
      </header>
      {open && <div className="fixed inset-0 top-[61px] z-30 overflow-y-auto bg-card lg:hidden">{side}</div>}
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase">{label}</span>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "verified" || status === "paid"
      ? "bg-primary/10 text-primary"
      : status === "rejected"
        ? "bg-destructive/10 text-destructive"
        : "bg-accent/30 text-accent-foreground";
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", tone)}>{status}</span>;
}
