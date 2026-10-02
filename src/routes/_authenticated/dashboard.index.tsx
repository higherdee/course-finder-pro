import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, Clock, Coins, Upload, Wallet } from "lucide-react";

import { PageHeader, StatCard, StatusBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, pointsToNaira } from "@/lib/constants";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/dashboard/")({ component: Overview });

function Overview() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: materials = [] } = useQuery({
    queryKey: ["my-materials", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("materials").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const verified = materials.filter((m) => m.status === "verified").length;
  const pending = materials.filter((m) => m.status === "pending").length;
  const points = profile?.points ?? 0;
  const plan = (profile?.study_plan ?? {}) as { hours_per_week?: number; days?: string[]; preferred_time?: string; target_cgpa?: string; goals?: string };

  return (
    <div>
      <PageHeader eyebrow={`${profile?.course ?? ""} · ${profile?.level ?? ""}`} title={`Welcome, ${profile?.full_name?.split(" ")[0] ?? "student"}`}>
        <Button asChild className="rounded-full"><a href="/dashboard/upload"><Upload /> Upload & earn 50 pts</a></Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Points" value={points} hint={`Worth ${formatNaira(pointsToNaira(points))}`} icon={Coins} />
        <StatCard label="Verified uploads" value={verified} icon={CheckCircle2} />
        <StatCard label="Awaiting review" value={pending} icon={Clock} />
        <StatCard label="Total downloads" value={materials.reduce((a, m) => a + m.downloads, 0)} hint="Of your verified materials" icon={ArrowRight} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent uploads</h2>
            <a href="/dashboard/materials" className="text-sm text-primary">View all</a>
          </div>
          {materials.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No uploads yet. Share your notes or past questions to start earning.</p>
          ) : (
            <ul className="divide-y divide-border">
              {materials.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.course} · {m.material_type}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold">Your study plan</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs text-muted-foreground">Hours / week</dt><dd className="font-semibold">{plan.hours_per_week ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Target CGPA</dt><dd className="font-semibold">{plan.target_cgpa ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Days</dt><dd className="font-semibold">{plan.days?.join(", ") ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Best time</dt><dd className="font-semibold">{plan.preferred_time ?? "—"}</dd></div>
            </dl>
            {plan.goals && <p className="mt-4 border-l-2 border-primary pl-3 text-sm text-muted-foreground">{plan.goals}</p>}
          </section>
          <section className="rounded-xl bg-primary p-5 text-primary-foreground">
            <Bot className="size-6" />
            <h2 className="mt-3 font-display text-xl font-semibold">Stuck on a topic?</h2>
            <p className="mt-1 text-sm opacity-85">Ask Boss, your AI study assistant, to explain, quiz or plan with you.</p>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="secondary" size="sm"><a href="/dashboard/assistant">Open assistant</a></Button>
              <Button asChild variant="secondary" size="sm"><a href="/dashboard/wallet"><Wallet /> Cash out</a></Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
