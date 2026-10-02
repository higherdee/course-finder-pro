import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SyllabossLogo } from "@/components/syllaboss-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).catch("signin").default("signin") });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Syllaboss" },
      { name: "description", content: "Sign in to Syllaboss or create a free account to save your study profile." },
      { property: "og:title", content: "Sign in or create an account — Syllaboss" },
      { property: "og:description", content: "Save your institution, course and level with a free Syllaboss account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="rounded-full bg-background/95 px-3 py-2 self-start"><SyllabossLogo /></div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Study with direction</p>
          <h2 className="mt-5 font-display text-5xl leading-tight">
            Your institution, course and level — <em className="text-accent">saved in one place.</em>
          </h2>
        </div>
        <p className="text-sm opacity-80">© 2026 Syllaboss</p>
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/20 blur-3xl" />
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><SyllabossLogo /></div>
          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <h1 className="font-display text-3xl font-semibold">Check your email</h1>
              <p className="mt-3 text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to finish creating your account.
              </p>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setSent(false)}>Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl font-semibold">{isSignup ? "Create your account" : "Welcome back"}</h1>
              <p className="mt-2 text-muted-foreground">
                {isSignup ? "Save your study profile and pick up where you left off." : "Sign in to continue to Syllaboss."}
              </p>

              <Button type="button" variant="outline" className="mt-8 h-12 w-full gap-3" onClick={google}>
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
                </div>
                <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">
                  {busy && <Loader2 className="animate-spin" />}
                  {isSignup ? "Create account" : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account? " : "New to Syllaboss? "}
                <Link to="/auth" search={{ mode: isSignup ? "signin" : "signup" }} className="font-semibold text-primary hover:underline">
                  {isSignup ? "Sign in" : "Create an account"}
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
