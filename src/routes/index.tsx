import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, FileSearch, Menu, Route as RouteIcon, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SearchSelect, type SearchOption } from "@/components/search-select";
import { SyllabossLogo } from "@/components/syllaboss-logo";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import courses from "@/data/courses.json";
import institutions from "@/data/institutions.json";

type Institution = {
  name: string;
  country: string;
  city?: string;
  rank?: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syllaboss — Find your institution and course" },
      {
        name: "description",
        content:
          "Search a worldwide directory of tertiary institutions and choose from verified Nigerian university courses with Syllaboss.",
      },
      { property: "og:title", content: "Syllaboss — Find your institution and course" },
      {
        property: "og:description",
        content: "A clear starting point for your institution, course and study path.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const institutionOptions: SearchOption[] = (institutions as Institution[]).map((institution) => ({
  label: institution.name,
  meta: [institution.city, institution.country].filter(Boolean).join(", "),
}));

const courseOptions: SearchOption[] = (courses as string[]).map((course) => ({ label: course }));

function HomePage() {
  const [institution, setInstitution] = useState<SearchOption | null>(null);
  const [course, setCourse] = useState<SearchOption | null>(null);
  const [level, setLevel] = useState("100 Level");
  const [started, setStarted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const institutionCount = useMemo(() => new Intl.NumberFormat("en-NG").format(institutionOptions.length), []);
  const { user } = useAuth();
  const canStart = Boolean(institution && course);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:px-6 lg:px-8">
          <div className="min-w-0 sm:mr-auto">
            <SyllabossLogo />
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#search" className="transition-colors hover:text-foreground">Find your path</a>
            <a href="#method" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#directory" className="transition-colors hover:text-foreground">Directory</a>
          </nav>
          <div className="hidden md:block"><UserMenu /></div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="border-t border-border px-4 py-3 md:hidden">
            {[['Find your path', '#search'], ['How it works', '#method'], ['Directory', '#directory']].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-3 text-sm text-foreground">
                {label}
              </a>
            ))}
            <div className="mt-2 border-t border-border pt-3"><UserMenu /></div>
          </nav>
        )}
      </header>

      <main>
        <section className="relative border-b border-border bg-hero">
          <div className="mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,0.78fr)] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-6 font-mono text-xs font-medium uppercase text-primary">
                Academic discovery, properly organised
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.03] sm:text-6xl lg:text-7xl">
                Know where you study. <em className="font-normal text-primary">Own what comes next.</em>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Syllaboss gives students one clear place to identify their institution, course and level before organising the work that matters.
              </p>
              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Institutions</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">{institutionCount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Countries</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">201</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-muted-foreground">Nigerian courses</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">{courseOptions.length}</dd>
                </div>
              </dl>
            </div>

            <div id="search" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
              <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="font-display text-2xl font-semibold text-card-foreground">Build your study profile</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Search, select, and the menu will close automatically.</p>
                </div>
                <span className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] uppercase text-secondary-foreground">{user ? "Saved to account" : "No account needed"}</span>
              </div>

              <div className="space-y-5">
                <SearchSelect
                  id="institution"
                  label="Tertiary institution"
                  placeholder="Search by name, city or country"
                  options={institutionOptions}
                  value={institution}
                  onChange={(option) => {
                    setInstitution(option);
                    setStarted(false);
                  }}
                />
                <SearchSelect
                  id="course"
                  label="Course of study in Nigeria"
                  placeholder="Search degree courses"
                  options={courseOptions}
                  value={course}
                  onChange={(option) => {
                    setCourse(option);
                    setStarted(false);
                  }}
                />
                <div>
                  <label htmlFor="level" className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Current level</label>
                  <select
                    id="level"
                    value={level}
                    onChange={(event) => {
                      setLevel(event.target.value);
                      setStarted(false);
                    }}
                    className="h-14 w-full rounded-md border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/15"
                  >
                    {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate"].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                size="lg"
                disabled={!canStart}
                onClick={() => setStarted(true)}
                className="mt-6 h-12 w-full justify-between rounded-full px-6"
              >
                Create my starting point <ArrowRight />
              </Button>

              {started && institution && course && (
                <div aria-live="polite" className="mt-5 border-l-2 border-primary bg-secondary p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Your starting point is ready</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {course.label} · {level}<br />{institution.label}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="method" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.62fr_1fr] lg:gap-20">
            <div>
              <p className="font-mono text-xs font-medium uppercase text-primary">The Syllaboss method</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">A useful profile before a crowded dashboard.</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
              {[
                [FileSearch, "01", "Find", "Search a worldwide institution directory without scrolling through an impossible list."],
                [BookOpen, "02", "Define", "Choose from a cleaned directory of Nigerian degree courses and your current study level."],
                [RouteIcon, "03", "Begin", "Get a clear academic starting point that can grow into your organised study workspace."],
              ].map(([Icon, number, title, copy]) => {
                const ItemIcon = Icon as typeof FileSearch;
                return (
                  <article key={String(number)} className="bg-card p-6 sm:p-7">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                      <ItemIcon className="size-5 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">{String(number)}</span>
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-semibold">{String(title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{String(copy)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="directory" className="border-y border-border bg-secondary">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-medium uppercase text-primary">Directory notes</p>
              <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Real records, stated honestly.</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                The institution search combines the supplied Nigerian list with an open worldwide university directory. Course names come from the supplied Nigerian article, with promotional and JAMB lesson copy removed.
              </p>
            </div>
            <a
              href="#search"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-foreground px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Search the directory <ArrowRight className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 lg:px-8">
        <SyllabossLogo />
        <p className="text-sm text-muted-foreground">© 2026 Syllaboss. Study with direction.</p>
      </footer>
    </div>
  );
}