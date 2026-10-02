import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SearchSelect, type SearchOption } from "@/components/search-select";
import { SyllabossLogo } from "@/components/syllaboss-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { courseOptions, institutionOptions, LEVELS, REFERRAL_SOURCES } from "@/lib/constants";
import { useProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — Syllaboss" },
      { name: "description", content: "Tell Syllaboss about your school, course and study plan." },
      { property: "og:title", content: "Set up your profile — Syllaboss" },
      { property: "og:description", content: "Three quick steps to personalise your Syllaboss dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Early morning", "Afternoon", "Evening", "Late night"];
const STEPS = ["Your details", "How you found us", "Study plan"];

function Onboarding() {
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState<SearchOption | null>(null);
  const [course, setCourse] = useState<SearchOption | null>(null);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("100 Level");
  const [referral, setReferral] = useState("");
  const [hours, setHours] = useState(10);
  const [days, setDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [time, setTime] = useState("Evening");
  const [cgpa, setCgpa] = useState("4.50");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (!profile) return;
    if (profile.onboarding_step >= 3) {
      navigate({ to: "/dashboard" });
      return;
    }
    setStep(profile.onboarding_step);
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    if (profile.institution) setInstitution({ label: profile.institution });
    if (profile.course) setCourse({ label: profile.course });
    setDepartment(profile.department ?? "");
    if (profile.level) setLevel(profile.level);
    setReferral(profile.referral_source ?? "");
  }, [profile, navigate]);

  async function save(values: Record<string, unknown>, next: number) {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...values, onboarding_step: next, updated_at: new Date().toISOString() })
      .eq("id", profile!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["profile"] });
    if (next >= 3) {
      toast.success("You're all set!");
      navigate({ to: "/dashboard" });
    } else setStep(next);
  }

  function next() {
    if (step === 0) {
      if (fullName.trim().length < 2 || !institution || !course) { toast.error("Add your name, school and course"); return; }
      if (phone && !/^\+?[0-9 ]{10,15}$/.test(phone)) { toast.error("Enter a valid phone number"); return; }
      save({ full_name: fullName.trim(), phone: phone.trim() || null, institution: institution.label, course: course.label, department: department.trim() || null, level }, 1);
    } else if (step === 1) {
      if (!referral) { toast.error("Pick one option"); return; }
      save({ referral_source: referral }, 2);
    } else {
      if (days.length === 0) { toast.error("Pick at least one study day"); return; }
      save({ study_plan: { hours_per_week: hours, days, preferred_time: time, target_cgpa: cgpa, goals: goals.trim() } }, 3);
    }
  }

  if (isLoading || !profile) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-14">
        <SyllabossLogo />
        <ol className="mt-10 grid grid-cols-3 gap-2">
          {STEPS.map((label, i) => (
            <li key={label}>
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
              <p className={cn("mt-2 text-xs", i === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {i + 1}. {label}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-3xl font-semibold">Tell us about you</h1>
                <p className="mt-1 text-sm text-muted-foreground">We use this to show materials for your course and school.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="fn">Full name</Label><Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="ph">Phone (optional)</Label><Input id="ph" value={phone} placeholder="0803 000 0000" onChange={(e) => setPhone(e.target.value)} /></div>
              </div>
              <SearchSelect id="inst" label="Institution" placeholder="Search your school" options={institutionOptions} value={institution} onChange={setInstitution} />
              <SearchSelect id="course" label="Course" placeholder="Search your course" options={courseOptions} value={course} onChange={setCourse} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="dep">Department / faculty</Label><Input id="dep" value={department} onChange={(e) => setDepartment(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label htmlFor="lvl">Level</Label>
                  <select id="lvl" value={level} onChange={(e) => setLevel(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-3xl font-semibold">Where did you hear about us?</h1>
                <p className="mt-1 text-sm text-muted-foreground">This helps us reach more students like you.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {REFERRAL_SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReferral(s)}
                    className={cn("flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition", referral === s ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50")}
                  >
                    {s}
                    {referral === s && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl font-semibold">Set your study plan</h1>
                <p className="mt-1 text-sm text-muted-foreground">Your assistant uses this to keep you on track.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hrs">Hours per week: <span className="font-semibold text-primary">{hours}</span></Label>
                <input id="hrs" type="range" min={2} max={40} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              </div>
              <div className="space-y-2">
                <Label>Study days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}
                      className={cn("rounded-full border px-4 py-2 text-sm", days.includes(d) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tm">Best time to study</Label>
                  <select id="tm" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TIMES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label htmlFor="cg">Target CGPA</Label><Input id="cg" value={cgpa} onChange={(e) => setCgpa(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="gl">Goals this semester</Label><Textarea id="gl" value={goals} placeholder="e.g. Pass MTH 101 with an A, finish my project early" onChange={(e) => setGoals(e.target.value)} /></div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="ghost" disabled={step === 0 || saving} onClick={() => setStep((s) => s - 1)}><ArrowLeft /> Back</Button>
            <Button onClick={next} disabled={saving} className="rounded-full px-6">
              {saving && <Loader2 className="animate-spin" />}
              {step === 2 ? "Finish" : "Continue"} <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
