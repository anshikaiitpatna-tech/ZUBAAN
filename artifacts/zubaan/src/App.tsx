import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from "wouter";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Library,
  MapPin,
  Menu,
  Mic2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  UserRound,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import {
  getGetCapsuleQueryKey,
  getGetLineageQueryKey,
  getListCapsulesQueryKey,
  useCreateLearningRequest,
  useCreateLineageResponse,
  useCreateRecording,
  useGetCapsule,
  useGetFeaturedCapsules,
  useGetLineage,
  useListArtisans,
  useListCapsules,
} from "@workspace/api-client-react";
import type { Artisan, Capsule, LineageNode } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import "./index.css";

const queryClient = new QueryClient();

const texturePalettes = [
  { ink: "#28504a", wash: "#dba079", paper: "#f3d7a7" },
  { ink: "#703a32", wash: "#edb85e", paper: "#efe2bd" },
  { ink: "#35556a", wash: "#d57d61", paper: "#e7cba5" },
  { ink: "#564936", wash: "#ca8d71", paper: "#e9d8b8" },
];

function paletteFor(index: number) {
  return texturePalettes[index % texturePalettes.length];
}

function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} — Zubaan`;
    const tag = document.querySelector('meta[name="description"]') ?? document.createElement("meta");
    tag.setAttribute("name", "description");
    tag.setAttribute("content", description);
    document.head.appendChild(tag);
  }, [title, description]);
  return null;
}

function Mark() {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Zubaan">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-foreground/30">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="absolute h-5 w-5 rounded-full border border-accent/70" />
      </span>
      <span className="font-editorial text-[1.55rem] leading-none tracking-[-.04em]">zubaan</span>
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [
    { href: "/", label: "The archive" },
    { href: "/record", label: "Leave a recording" },
    { href: "/about", label: "About Zubaan" },
  ];
  return (
    <div className="paper-grain min-h-[100dvh] bg-background text-foreground">
      <header className="relative z-40 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="text-foreground" data-testid="link-brand-home"><Mark /></Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-foreground/65 transition hover:text-foreground" data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/artisan-inbox" className="rounded-full border border-foreground/20 px-4 py-2 font-mono-ui text-[10px] uppercase tracking-[.12em] transition hover:border-foreground/50 hover:bg-foreground hover:text-background" data-testid="link-artisan-inbox">
            Artisan inbox
          </Link>
        </nav>
        <button onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-foreground/20 p-2 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} data-testid="button-mobile-menu">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        {menuOpen && (
          <nav className="absolute left-5 right-5 top-[72px] flex flex-col gap-1 rounded-2xl border border-border bg-card p-3 shadow-xl md:hidden" aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-mono-ui text-xs uppercase tracking-[.12em] hover:bg-muted" data-testid={`link-mobile-${item.href.slice(1) || "home"}`}>{item.label}</Link>
            ))}
            <Link href="/artisan-inbox" onClick={() => setMenuOpen(false)} className="rounded-xl bg-primary px-4 py-3 font-mono-ui text-xs uppercase tracking-[.12em] text-primary-foreground" data-testid="link-mobile-inbox">Artisan inbox</Link>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mx-auto mt-24 flex max-w-[1440px] flex-col gap-6 border-t border-border px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
        <div>
          <Mark />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">A living archive of Indian craft, kept in the voices of the people who carry it.</p>
        </div>
        <div className="flex items-center gap-5 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
          <Link href="/about" data-testid="link-footer-about">Our approach</Link>
          <span>© {new Date().getFullYear()} Zubaan</span>
        </div>
      </footer>
    </div>
  );
}

function SectionEyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`font-mono-ui text-[10px] uppercase tracking-[.2em] ${light ? "text-background/60" : "text-muted-foreground"}`}>{children}</p>;
}

function Avatar({ artisan, size = "md" }: { artisan?: Artisan; size?: "sm" | "md" | "lg" }) {
  const initials = artisan?.initials ?? artisan?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "Z";
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-11 w-11 text-xs";
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-accent/30 font-mono-ui font-medium text-foreground ${sizeClass}`} data-testid={`avatar-${artisan?.id ?? "fallback"}`}>{initials}</span>;
}

function TextureTile({ index = 0, className = "" }: { index?: number; className?: string }) {
  const p = paletteFor(index);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: p.paper }} aria-hidden="true">
      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[18px]" style={{ borderColor: p.wash }} />
      <div className="absolute bottom-0 left-0 h-2/3 w-1/2 -skew-x-12 opacity-80" style={{ backgroundColor: p.ink }} />
      <div className="absolute bottom-[-22%] right-[9%] h-3/5 w-1/3 rotate-12 rounded-t-full opacity-80" style={{ backgroundColor: p.wash }} />
      <div className="absolute left-[43%] top-1/4 h-20 w-20 rounded-full border-[10px]" style={{ borderColor: p.ink }} />
      <div className="absolute inset-x-0 bottom-0 h-1/4 opacity-25" style={{ background: `repeating-linear-gradient(90deg, ${p.ink} 0 2px, transparent 2px 12px)` }} />
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Library size={20} /></span>
      <h3 className="font-editorial text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{detail}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-14 text-center"><CircleHelp className="mb-4 text-accent" /><h3 className="font-editorial text-2xl">The shelf is quiet for a moment</h3><p className="mt-2 text-sm text-muted-foreground">We could not reach the archive. Your place is held.</p><button onClick={retry} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary-foreground" data-testid="button-retry-archive"><RotateCcw size={14} /> Try again</button></div>;
}

function CapsuleCard({ capsule, index = 0 }: { capsule: Capsule; index?: number }) {
  return (
    <Link href={`/capsule/${capsule.id}`} className="group block" data-testid={`card-capsule-${capsule.id}`}>
      <article className="lift overflow-hidden rounded-[1.25rem] border border-border bg-card">
        <TextureTile index={index} className="aspect-[1.28] transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 font-mono-ui text-[9px] uppercase tracking-[.14em] text-muted-foreground">
            <span>{capsule.craft}</span><span>{capsule.duration}</span>
          </div>
          <h3 className="font-editorial text-[1.7rem] leading-[.95] tracking-[-.025em]">{capsule.title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{capsule.description}</p>
          <div className="flex items-center gap-3 border-t border-border pt-4"><Avatar artisan={capsule.artisan} size="sm" /><span className="text-xs text-foreground/75">{capsule.artisan.name} <span className="text-muted-foreground">· {capsule.village}</span></span><ArrowUpRight size={15} className="ml-auto text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
        </div>
      </article>
    </Link>
  );
}

function Home() {
  const [filters, setFilters] = useState<{ craft?: string; dialect?: string; region?: string }>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const featured = useGetFeaturedCapsules();
  const capsules = useListCapsules(filters, { query: { queryKey: getListCapsulesQueryKey(filters) } });
  const artisans = useListArtisans();
  const list = capsules.data ?? [];
  const featuredList = featured.data ?? [];
  const craftOptions = useMemo(() => Array.from(new Set(list.map((item) => item.craft))).filter(Boolean), [list]);
  const regionOptions = useMemo(() => Array.from(new Set(list.map((item) => item.region))).filter(Boolean), [list]);
  const dialectOptions = useMemo(() => Array.from(new Set(list.map((item) => item.dialect))).filter(Boolean), [list]);
  const hasFilters = Boolean(filters.craft || filters.region || filters.dialect);
  const filterGroups: Array<[keyof typeof filters, string, string[]]> = [["craft", "Craft", craftOptions], ["dialect", "Language", dialectOptions], ["region", "Region", regionOptions]];
  return (
    <Shell>
      <PageMeta title="Living Heritage" description="Listen to Indian craft traditions in the voices of the people who carry them." />
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-[1.1fr_.9fr] md:items-end md:pt-20 lg:px-12 lg:pb-24">
        <div className="fade-up">
          <SectionEyebrow>Living heritage · Sujani & beyond</SectionEyebrow>
          <h1 className="mt-5 max-w-3xl font-editorial text-[clamp(3.4rem,8.5vw,7.6rem)] leading-[.82] tracking-[-.055em]">What the hands<br /><em>remember.</em></h1>
          <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">Zubaan keeps India’s living crafts in the voices of the people who carry them — starting with Sujani embroidery from Bihar, spoken in the dialect it was taught in.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#archive" className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 font-mono-ui text-[11px] uppercase tracking-[.14em] text-primary-foreground transition hover:gap-4" data-testid="link-browse-archive">Browse the voices <ArrowDownRight size={15} /></a>
            <Link href="/record" className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-6 py-3.5 font-mono-ui text-[11px] uppercase tracking-[.14em] transition hover:border-foreground/55 hover:bg-foreground/5" data-testid="link-record-hero"><Mic2 size={14} /> Leave a voice</Link>
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[#dfbf8e] fade-up fade-up-delay-2 md:min-h-[500px]">
          <TextureTile index={2} className="absolute inset-0 opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#254d45]/75 via-transparent to-transparent" />
          <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-[#f5e3c4]">
            <div><SectionEyebrow light>Featured voice</SectionEyebrow><p className="mt-2 font-editorial text-3xl leading-none">The blue of<br />a monsoon sky</p></div>
            <Link href={featuredList[0] ? `/capsule/${featuredList[0].id}` : "/"} className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f5e3c4]/50 transition hover:bg-[#f5e3c4] hover:text-[#254d45]" aria-label="Play featured voice" data-testid="link-featured-play"><Play size={16} fill="currentColor" /></Link>
          </div>
          <span className="absolute right-6 top-6 font-mono-ui text-[9px] uppercase tracking-[.15em] text-[#f5e3c4]/80">Field note no. 18</span>
        </div>
      </section>
      <section className="border-y border-border bg-secondary/35 py-7">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-10 gap-y-4 px-5 sm:px-8 lg:px-12">
          <SectionEyebrow>In the archive</SectionEyebrow>
          <span className="font-editorial text-2xl">{list.length || "—"} voices</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-editorial text-2xl">{artisans.data?.length || "—"} makers</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span className="font-editorial text-2xl">many ways of knowing</span>
        </div>
      </section>
      <section id="archive" className="mx-auto max-w-[1440px] scroll-mt-8 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><SectionEyebrow>The listening room / 02</SectionEyebrow><h2 className="mt-4 font-editorial text-5xl leading-none tracking-[-.04em] sm:text-6xl">Find a thread.</h2></div><button onClick={() => setFilterOpen((open) => !open)} className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 font-mono-ui text-[10px] uppercase tracking-[.14em] transition ${hasFilters ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20 hover:border-foreground/50"}`} data-testid="button-toggle-filters">Filter the archive <ChevronDown size={14} className={filterOpen ? "rotate-180" : ""} /></button></div>
        {filterOpen && <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-3 fade-up" data-testid="panel-archive-filters">{filterGroups.map(([key, label, options]) => <label key={String(key)} className="flex flex-col gap-2 font-mono-ui text-[10px] uppercase tracking-[.12em] text-muted-foreground">{String(label)}<select value={filters[key] ?? ""} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value || undefined }))} className="rounded-xl border border-input bg-background px-3 py-3 font-sans text-sm normal-case tracking-normal text-foreground outline-none focus:ring-2 focus:ring-ring" data-testid={`select-filter-${key}`}><option value="">All {String(label).toLowerCase()}s</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div>}
        {hasFilters && <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground"><span>Showing a considered selection</span><button onClick={() => setFilters({})} className="underline underline-offset-4" data-testid="button-clear-filters">Clear filters</button></div>}
        <div className="mt-10">{capsules.isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="aspect-[.95]" /><Skeleton className="aspect-[.95]" /><Skeleton className="aspect-[.95]" /></div> : capsules.isError ? <ErrorState retry={() => void capsules.refetch()} /> : list.length === 0 ? <EmptyState title="No voices on this thread yet" detail="Try another filter, or be the first person to leave a recording for this tradition." action={<Link href="/record" className="rounded-full bg-primary px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary-foreground" data-testid="link-empty-record">Leave a recording</Link>} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((capsule, index) => <CapsuleCard key={capsule.id} capsule={capsule} index={index} />)}</div>}</div>
      </section>
      {featuredList.length > 0 && <section className="bg-primary px-5 py-20 text-primary-foreground sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><SectionEyebrow light>Recently held / 03</SectionEyebrow><h2 className="mt-4 max-w-2xl font-editorial text-5xl leading-[.88] tracking-[-.04em] sm:text-7xl">A tradition is<br /><em>never finished.</em></h2></div><p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65">Every voice leaves a door open for the next person to walk through.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{featuredList.slice(0, 3).map((capsule, index) => <Link key={capsule.id} href={`/capsule/${capsule.id}`} className="group border-t border-primary-foreground/20 pt-5" data-testid={`link-featured-capsule-${capsule.id}`}><div className="flex items-start justify-between gap-4"><div><p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-primary-foreground/55">{capsule.artisan.name} · {capsule.region}</p><h3 className="mt-5 font-editorial text-3xl leading-none">{capsule.title}</h3></div><ArrowRight className="mt-1 transition-transform group-hover:translate-x-1" size={17} /></div><div className="mt-6 flex items-center gap-3 text-xs text-primary-foreground/60"><Clock3 size={14} /> {capsule.duration} · {capsule.dialect}</div></Link>)}</div></div></section>}
    </Shell>
  );
}

function RecordPage() {
  const createRecording = useCreateRecording();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [title, setTitle] = useState("");
  const [artisanName, setArtisanName] = useState("");
  const [craft, setCraft] = useState("");
  const [dialect, setDialect] = useState("");
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const toggleRecording = () => {
    if (recording) {
      window.clearInterval(timer.current);
      setRecording(false);
      return;
    }
    setSaved(false);
    setRecording(true);
    timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000);
  };
  const saveRecording = () => {
    if (!title.trim()) return;
    createRecording.mutate(
      {
        data: {
          title: title.trim(),
          duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
          artisanName: artisanName || undefined,
          craft: craft || undefined,
          dialect: dialect || undefined,
          audioData: null,
        },
      },
      { onSuccess: () => setSaved(true) },
    );
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Shell>
      <PageMeta title="Leave a recording" description="Add your voice to Zubaan's living archive." />
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-12 sm:px-8 md:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[.14em] text-muted-foreground hover:text-foreground"
          data-testid="link-record-back"
        >
          <ArrowLeft size={14} /> Back to the archive
        </Link>

        <div className="mt-12 text-center">
          <SectionEyebrow>A small act of keeping</SectionEyebrow>
          <h1 className="mt-5 font-editorial text-5xl leading-[.84] tracking-[-.05em] sm:text-7xl">
            Leave a voice<br /><em>for tomorrow.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            One button. No forms first. Speak in the language that feels like home — the words will meet the page later.
          </p>
        </div>

        {/* Primary: recording surface */}
        <div className="relative mx-auto mt-12 max-w-xl rounded-[2rem] border border-border bg-card p-6 sm:p-9">
          <div className="record-orbit pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-accent/60 border-dashed" />
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl bg-secondary/60">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-lg transition-transform duration-500"
              style={{ transform: recording ? "scale(1.1)" : "scale(1)" }}
            >
              <Waves size={30} className={recording ? "pulse-line" : ""} />
            </div>
            <p className="mt-5 font-mono-ui text-base tracking-[.12em]" data-testid="text-recording-time">
              {time}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {recording ? "Listening for your story…" : "Press when you are ready"}
            </p>
          </div>

          <button
            onClick={toggleRecording}
            className={`mx-auto mt-7 flex w-full items-center justify-center gap-3 rounded-full px-5 py-4 font-mono-ui text-[11px] uppercase tracking-[.14em] transition ${
              recording ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
            }`}
            data-testid="button-toggle-recording"
          >
            {recording ? (
              <><Pause size={16} /> Finish recording</>
            ) : (
              <><Mic2 size={16} /> Start recording</>
            )}
          </button>
          {recording && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You can stop whenever the thought is complete.
            </p>
          )}
        </div>

        {/* Secondary: light metadata */}
        <div className="mx-auto mt-10 max-w-xl">
          <p className="mb-5 font-mono-ui text-[11px] uppercase tracking-[.14em] text-muted-foreground">
            A few words so others can find this voice
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">
                Give this memory a name <span className="text-accent">*</span>
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A name you will remember"
                className="mt-2 w-full border-b border-input bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground/55 focus:border-primary"
                data-testid="input-recording-title"
              />
            </label>
            <label>
              <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">Your name</span>
              <input
                value={artisanName}
                onChange={(event) => setArtisanName(event.target.value)}
                placeholder="How should we call you?"
                className="mt-2 w-full border-b border-input bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-primary"
                data-testid="input-artisan-name"
              />
            </label>
            <label>
              <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">Craft or practice</span>
              <input
                value={craft}
                onChange={(event) => setCraft(event.target.value)}
                placeholder="What do your hands make?"
                className="mt-2 w-full border-b border-input bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-primary"
                data-testid="input-recording-craft"
              />
            </label>
            <label>
              <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">Language / dialect</span>
              <input
                value={dialect}
                onChange={(event) => setDialect(event.target.value)}
                placeholder="The language of this telling"
                className="mt-2 w-full border-b border-input bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-primary"
                data-testid="input-recording-dialect"
              />
            </label>
            <div className="flex items-end sm:col-span-2">
              <button
                disabled={!title.trim() || createRecording.isPending}
                onClick={saveRecording}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-foreground/25 px-5 py-3.5 font-mono-ui text-[11px] uppercase tracking-[.14em] transition hover:border-foreground hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                data-testid="button-save-recording"
              >
                {createRecording.isPending ? (
                  "Saving…"
                ) : saved ? (
                  <><Check size={14} /> Held in the archive</>
                ) : (
                  <><Send size={14} /> Save this voice</>
                )}
              </button>
            </div>
          </div>
        </div>

        {createRecording.isError && (
          <p className="mt-5 text-center text-xs text-destructive" data-testid="status-recording-error">
            We could not save this yet. Please try again.
          </p>
        )}
        {saved && (
          <div
            className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-xl bg-secondary/60 p-4 text-center text-sm"
            data-testid="status-recording-saved"
          >
            <Check size={16} className="text-primary" /> Your voice has a place here.
          </div>
        )}
      </section>
    </Shell>
  );
}

function Waveform({ playing, dark = false }: { playing: boolean; dark?: boolean }) {
  return <div className="flex h-10 items-center gap-[3px]" aria-hidden="true">{Array.from({ length: 48 }).map((_, index) => <span key={index} className={`w-[3px] rounded-full ${dark ? "bg-background/50" : "bg-primary/55"} ${playing && index % 4 === 0 ? "pulse-line" : ""}`} style={{ height: `${12 + ((index * 19) % 26)}%`, animationDelay: `${index * 20}ms` }} />)}</div>;
}

function RequestForm({ capsuleId, onClose }: { capsuleId: string; onClose: () => void }) {
  const request = useCreateLearningRequest();
  const [form, setForm] = useState({ topic: "", date: "", time: "", mode: "In person", learnerName: "" });
  const [sent, setSent] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  if (sent) return (
    <div className="rounded-2xl bg-secondary/70 p-8 text-center">
      <Check className="mx-auto text-primary" size={28} />
      <h3 className="mt-4 font-editorial text-3xl">Your request is on its way.</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The artisan will hear that you would like to learn together. The relationship stays between you two.</p>
      <button onClick={onClose} className="mt-6 rounded-full border border-foreground/20 px-5 py-2.5 font-mono-ui text-[11px] uppercase tracking-[.14em]" data-testid="button-close-request-success">Close</button>
    </div>
  );
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <SectionEyebrow>A direct invitation</SectionEyebrow>
          <h3 className="mt-3 font-editorial text-3xl">Learn with me</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close request form" data-testid="button-close-request"><X size={17} /></button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tell the artisan what you would like to spend time learning. This is a request, not a booking — they decide.</p>

      {/* Fair rate transparency */}
      <div className="mt-5 rounded-xl border border-dashed border-primary/25 bg-primary/5 px-4 py-3.5">
        <p className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary/80">Suggested community rate</p>
        <p className="mt-1 font-editorial text-2xl leading-none">₹350–₹500 <span className="text-sm font-normal text-muted-foreground">/ 45 min</span></p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Zubaan takes no commission. The artisan can adjust the rate.</p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">I would like to learn</span>
          <textarea value={form.topic} onChange={(e) => update("topic", e.target.value)} rows={2} placeholder="The gesture, material, or story that stayed with you" className="mt-2 w-full resize-none rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-learning-topic" />
        </label>
        <label>
          <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">A day that suits me</span>
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-learning-date" />
        </label>
        <label>
          <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">A time that suits me</span>
          <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-learning-time" />
        </label>
        <label>
          <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">How we might meet</span>
          <select value={form.mode} onChange={(e) => update("mode", e.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="select-learning-mode">
            <option>In person</option>
            <option>Voice call</option>
            <option>Video call</option>
          </select>
        </label>
        <label>
          <span className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">Your name</span>
          <input value={form.learnerName} onChange={(e) => update("learnerName", e.target.value)} placeholder="So the artisan knows who is calling" className="mt-2 w-full rounded-xl border border-input bg-background p-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-learning-name" />
        </label>
      </div>
      <button
        disabled={request.isPending || !form.topic || !form.date || !form.time || !form.learnerName}
        onClick={() => request.mutate({ data: { capsuleId, topic: form.topic, date: form.date, time: form.time, mode: form.mode as "In person" | "Voice call" | "Video call", learnerName: form.learnerName } }, { onSuccess: () => setSent(true) })}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 font-mono-ui text-[11px] uppercase tracking-[.14em] text-primary-foreground disabled:opacity-45"
        data-testid="button-send-learning-request"
      >
        {request.isPending ? "Sending the invitation..." : <><Send size={15} /> Send the invitation</>}
      </button>
      {request.isError && <p className="mt-3 text-center text-xs text-destructive">That did not travel. Please try once more.</p>}
    </div>
  );
}

function CapsulePage() {
  const params = useParams<{ id: string }>();
  const capsuleQuery = useGetCapsule(params.id ?? "", { query: { queryKey: getGetCapsuleQueryKey(params.id ?? ""), enabled: Boolean(params.id) } });
  const capsule = capsuleQuery.data;
  const [playing, setPlaying] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showBridge, setShowBridge] = useState(true);
  if (capsuleQuery.isLoading) return <Shell><div className="mx-auto max-w-5xl px-5 py-24"><Skeleton className="h-6 w-32" /><Skeleton className="mt-8 h-20 w-3/4" /><Skeleton className="mt-12 h-64 w-full" /></div></Shell>;
  if (capsuleQuery.isError || !capsule) return <Shell><div className="mx-auto max-w-2xl px-5 py-24"><ErrorState retry={() => void capsuleQuery.refetch()} /></div></Shell>;
  return <Shell><PageMeta title={capsule.title} description={capsule.description} /><article className="mx-auto max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12"><Link href="/" className="inline-flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground hover:text-foreground" data-testid="link-capsule-back"><ArrowLeft size={14} /> Archive</Link><div className="mt-14 grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end"><div className="fade-up"><SectionEyebrow>{capsule.lineage} / {capsule.date}</SectionEyebrow><h1 className="mt-5 max-w-xl font-editorial text-[clamp(3.4rem,7vw,7rem)] leading-[.8] tracking-[-.06em]">{capsule.title}</h1><p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground">{capsule.description}</p><div className="mt-8 flex items-center gap-4"><Avatar artisan={capsule.artisan} size="lg" /><div><p className="font-editorial text-2xl leading-none">{capsule.artisan.name}</p><p className="mt-2 font-mono-ui text-[10px] uppercase tracking-[.12em] text-muted-foreground">{capsule.village}, {capsule.region} · {capsule.dialect}</p></div></div></div><div className="fade-up fade-up-delay-2"><TextureTile index={3} className="aspect-[1.45] rounded-[2rem]" /></div></div><section className="mt-16 rounded-[2rem] bg-primary p-6 text-primary-foreground sm:p-10"><div className="flex items-center justify-between gap-4"><div><SectionEyebrow light>Listen / {capsule.duration}</SectionEyebrow><p className="mt-3 font-editorial text-3xl">{capsule.artisan.name}'s voice</p></div><button onClick={() => setPlaying((value) => !value)} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background text-foreground transition hover:scale-105" aria-label={playing ? "Pause recording" : "Play recording"} data-testid="button-play-capsule">{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button></div><div className="mt-8"><Waveform playing={playing} dark /><div className="mt-3 flex justify-between font-mono-ui text-[9px] uppercase tracking-[.12em] text-primary-foreground/55"><span>00:00</span><span>{capsule.duration}</span></div></div>{capsule.audioUrl && <audio src={capsule.audioUrl} controls className="mt-6 w-full" />}</section><div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_.8fr]"><section><div className="flex items-center justify-between border-b border-border pb-4"><div><SectionEyebrow>Words held in sound</SectionEyebrow><h2 className="mt-2 font-editorial text-4xl">Transcript</h2></div><button onClick={() => setShowBridge((value) => !value)} className="rounded-full border border-foreground/20 px-3 py-2 font-mono-ui text-[9px] uppercase tracking-[.12em]" data-testid="button-toggle-translation">{showBridge ? "Hide translation" : "Show translation"}</button></div><div className="divide-y divide-border">{capsule.transcript?.length ? capsule.transcript.map((line, index) => <div key={line.id} className="grid gap-3 py-6 sm:grid-cols-[60px_1fr]"><span className="font-mono-ui text-[10px] text-muted-foreground">{String(Math.floor(line.start / 60)).padStart(2, "0")}:{String(Math.floor(line.start % 60)).padStart(2, "0")}</span><div><p className="font-editorial text-2xl leading-tight">{line.original}</p>{showBridge && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{line.bridge}</p>}</div></div>) : <EmptyState title="The transcript is still being held" detail="Listen to the voice while our editors prepare the words." />}</div></section><aside className="space-y-5"><div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-2"><BookOpen size={16} className="text-accent" /><SectionEyebrow>Glossary</SectionEyebrow></div><dl className="mt-5 space-y-5"><div><dt className="font-editorial text-xl">The first gesture</dt><dd className="mt-1 text-sm leading-relaxed text-muted-foreground">Every craft has a beginning that cannot be rushed.</dd></div><div><dt className="font-editorial text-xl">A living material</dt><dd className="mt-1 text-sm leading-relaxed text-muted-foreground">What changes with each hand is part of the teaching.</dd></div></dl></div><div className="rounded-2xl border border-border p-6"><SectionEyebrow>Take the next step</SectionEyebrow><h3 className="mt-3 font-editorial text-3xl leading-none">Learn with {capsule.artisan.name.split(" ")[0]}.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A respectful request can become a shared afternoon, a call, or the start of another thread.</p>{requesting ? <div className="mt-6"><RequestForm capsuleId={capsule.id} onClose={() => setRequesting(false)} /></div> : <button onClick={() => setRequesting(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-accent-foreground" data-testid="button-open-learning-request"><UserRound size={15} /> Send a learning request</button>}</div><Link href={`/lineage/${capsule.id}`} className="flex items-center justify-between rounded-2xl bg-secondary p-5 transition hover:bg-secondary/70" data-testid="link-capsule-lineage"><span><SectionEyebrow>Follow the thread</SectionEyebrow><span className="mt-2 block font-editorial text-2xl">See its lineage</span></span><ArrowRight size={17} /></Link></aside></div></article></Shell>;
}

function LineagePage() {
  const params = useParams<{ id: string }>();
  const lineageQuery = useGetLineage(params.id ?? "", { query: { queryKey: getGetLineageQueryKey(params.id ?? ""), enabled: Boolean(params.id) } });
  const createResponse = useCreateLineageResponse();
  const lineage = lineageQuery.data;
  const [selected, setSelected] = useState<LineageNode | undefined>();
  const [form, setForm] = useState({ title: "", description: "", learnerName: "", location: "" });
  const [sent, setSent] = useState(false);
  if (lineageQuery.isLoading) return <Shell><div className="mx-auto max-w-5xl px-5 py-24"><Skeleton className="h-8 w-72" /><Skeleton className="mt-8 h-[420px] w-full" /></div></Shell>;
  if (lineageQuery.isError || !lineage) return <Shell><div className="mx-auto max-w-2xl px-5 py-24"><ErrorState retry={() => void lineageQuery.refetch()} /></div></Shell>;
  const nodes = lineage.nodes ?? [];
  return <Shell><PageMeta title={`${lineage.title} lineage`} description="Follow a craft tradition through the voices that continue it." /><section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 lg:px-12"><Link href={lineage.root.capsuleId ? `/capsule/${lineage.root.capsuleId}` : "/"} className="inline-flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground" data-testid="link-lineage-back"><ArrowLeft size={14} /> Return to the voice</Link><div className="mt-14"><SectionEyebrow>Tradition / living map</SectionEyebrow><h1 className="mt-5 max-w-3xl font-editorial text-6xl leading-[.82] tracking-[-.05em] sm:text-8xl">{lineage.title}</h1><p className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground">A lineage is not a straight line. It is a set of hands, each leaving room for the next.</p></div><div className="relative mt-14 min-h-[500px] overflow-hidden rounded-[2rem] border border-border bg-secondary/45 p-6 sm:p-10"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)/.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/.15) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />{nodes.map((node, index) => <button key={node.id} onClick={() => setSelected(node)} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left transition hover:scale-105 ${node.type === "root" ? "w-44" : "w-40"}`} style={{ left: `${Math.min(86, Math.max(14, node.x))}%`, top: `${Math.min(82, Math.max(18, node.y))}%` }} data-testid={`button-lineage-node-${node.id}`}><span className={`block rounded-2xl border p-4 shadow-sm ${node.type === "root" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}><span className="flex items-center justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-current/25 font-mono-ui text-[9px]">{node.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>{node.type === "continuation" && <Plus size={13} />}</span><span className="mt-4 block font-editorial text-xl leading-none">{node.title}</span><span className="mt-2 block font-mono-ui text-[9px] uppercase tracking-[.1em] opacity-60">{node.name} · {node.location}</span></span></button>)}{nodes.length < 2 && <div className="absolute inset-0 flex items-center justify-center"><EmptyState title="The first thread is being prepared" detail="When another voice joins this tradition, it will appear here." /></div>}</div><div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]"><div><SectionEyebrow>Selected continuation</SectionEyebrow>{selected ? <div className="mt-4 rounded-2xl border border-border bg-card p-6"><div className="flex items-start justify-between"><div><h2 className="font-editorial text-3xl">{selected.title}</h2><p className="mt-2 text-sm text-muted-foreground">{selected.name} · {selected.location}</p></div><button onClick={() => setSelected(undefined)} aria-label="Close selected continuation" className="rounded-full p-2 hover:bg-muted" data-testid="button-close-lineage-detail"><X size={16} /></button></div><p className="mt-5 text-sm leading-relaxed text-muted-foreground">This voice extends the thread through a new place, a new season, and a different pair of hands.</p></div> : <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Choose a node on the map to listen for what changed — and what stayed.</p>}</div><div className="rounded-2xl border border-border bg-card p-6"><SectionEyebrow>Add your continuation</SectionEyebrow><h2 className="mt-3 font-editorial text-3xl leading-none">What will you carry forward?</h2>{sent ? <div className="mt-6 text-sm leading-relaxed" data-testid="status-lineage-sent"><Check className="mb-3 text-primary" />Thank you. Your continuation has a place in this lineage.</div> : <div className="mt-5 space-y-3"><input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} placeholder="Name your continuation" className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-lineage-title" /><textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} placeholder="A few words about what changed" rows={3} className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-lineage-description" /><div className="grid grid-cols-2 gap-3"><input value={form.learnerName} onChange={(e) => setForm((v) => ({ ...v, learnerName: e.target.value }))} placeholder="Your name" className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-lineage-name" /><input value={form.location} onChange={(e) => setForm((v) => ({ ...v, location: e.target.value }))} placeholder="Your place" className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" data-testid="input-lineage-location" /></div><button disabled={createResponse.isPending || !form.title || !form.description || !form.learnerName || !form.location} onClick={() => createResponse.mutate({ data: { parentId: lineage.root.id, title: form.title, description: form.description, learnerName: form.learnerName, location: form.location, audioData: null } }, { onSuccess: () => setSent(true) })} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-mono-ui text-[10px] uppercase tracking-[.13em] text-primary-foreground disabled:opacity-40" data-testid="button-submit-lineage-response">{createResponse.isPending ? "Adding your thread..." : <><Plus size={14} /> Add my continuation</>}</button></div>}</div></div></section></Shell>;
}

function ArtisanInbox() {
  const [requests, setRequests] = useState([
    { id: "request-1", name: "Maya Sen", place: "Pune", topic: "the first blue wash", mode: "Voice call", time: "Tomorrow · 5:30 pm", status: "pending" },
    { id: "request-2", name: "Arjun Rao", place: "Bengaluru", topic: "how the loom listens", mode: "In person", time: "Saturday · 11:00 am", status: "pending" },
  ]);
  const [activeId, setActiveId] = useState("request-1");
  const active = requests.find((request) => request.id === activeId) ?? requests[0];
  const decide = (status: "accepted" | "declined") =>
    setRequests((items) => items.map((item) => (item.id === active.id ? { ...item, status } : item)));

  return (
    <Shell>
      <PageMeta title="Artisan inbox" description="A simple place to respond to people who want to learn from you." />
      <section className="mx-auto max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <SectionEyebrow>Your listening room</SectionEyebrow>
          <h1 className="mt-5 font-editorial text-5xl leading-[.84] tracking-[-.05em] sm:text-7xl">
            People are<br /><em>waiting to learn.</em>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground">
            Each request can be heard in your own language. A yes opens a conversation. A no is also an honest answer.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-3">
            {requests.map((request) => (
              <button
                key={request.id}
                onClick={() => setActiveId(request.id)}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  active.id === request.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-foreground/40"
                }`}
                data-testid={`button-request-${request.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-editorial text-2xl">{request.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-[.1em] ${
                      active.id === request.id ? "bg-background/15" : "bg-muted"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${active.id === request.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {request.topic}
                </p>
                <p
                  className={`mt-4 font-mono-ui text-[10px] uppercase tracking-[.11em] ${
                    active.id === request.id ? "text-primary-foreground/55" : "text-muted-foreground"
                  }`}
                >
                  {request.time}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionEyebrow>Learning request</SectionEyebrow>
                <h2 className="mt-3 font-editorial text-4xl leading-none">{active.name} would like to learn</h2>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 font-mono-ui text-xs">
                {active.name.split(" ").map((word) => word[0]).join("")}
              </span>
            </div>

            {/* Voice-first affordance */}
            <button
              type="button"
              className="mt-8 flex w-full items-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-left transition hover:bg-primary/10"
              data-testid="button-play-request-voice"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Volume2 size={18} />
              </span>
              <span>
                <span className="block font-mono-ui text-[10px] uppercase tracking-[.14em] text-primary/80">Tap to hear the request</span>
                <span className="mt-1 block text-sm leading-relaxed text-foreground/80">
                  “{active.name} from {active.place} wants to learn {active.topic}.”
                </span>
              </span>
            </button>

            <div className="mt-6 rounded-2xl bg-secondary/60 p-6">
              <p className="font-editorial text-3xl leading-tight">“{active.topic}”</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">
                <span className="flex items-center gap-2"><Clock3 size={14} /> {active.time}</span>
                <span className="flex items-center gap-2"><Volume2 size={14} /> {active.mode}</span>
                <span className="flex items-center gap-2"><MapPin size={14} /> {active.place}</span>
              </div>
            </div>

            {active.status === "pending" ? (
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => decide("accepted")}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 font-mono-ui text-[11px] uppercase tracking-[.14em] text-primary-foreground"
                  data-testid="button-accept-request"
                >
                  <Check size={16} /> I can make time
                </button>
                <button
                  onClick={() => decide("declined")}
                  className="flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 py-4 font-mono-ui text-[11px] uppercase tracking-[.14em]"
                  data-testid="button-decline-request"
                >
                  <X size={16} /> Not this time
                </button>
              </div>
            ) : (
              <div className="mt-10 rounded-xl bg-muted p-4 text-sm" data-testid="status-request-decision">
                {active.status === "accepted"
                  ? "You said yes. The learner will receive your invitation to continue the conversation. The relationship stays between you."
                  : "You passed on this request. Your honest answer has been noted."}
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}

function About() {
  return <Shell><PageMeta title="About Zubaan" description="Why Zubaan keeps craft knowledge in voices, not just objects." /><section className="mx-auto max-w-[1100px] px-5 pb-20 pt-16 sm:px-8 md:pt-24 lg:px-12"><SectionEyebrow>A note from Zubaan</SectionEyebrow><h1 className="mt-6 max-w-4xl font-editorial text-6xl leading-[.8] tracking-[-.06em] sm:text-8xl">Some knowledge<br /><em>needs a voice.</em></h1><div className="mt-16 grid gap-12 border-t border-border pt-10 md:grid-cols-[.7fr_1.3fr]"><p className="font-editorial text-3xl leading-tight">Zubaan means tongue, language, voice. It is the part of us that lets knowledge travel.</p><div className="space-y-10 text-sm leading-[1.85] text-muted-foreground"><p>India’s craft traditions are not only things to be seen. They are timing, pressure, weather, memory. They live in the sentence an elder repeats while a younger hand tries again.</p><p>We record those sentences. We make room for the original language and a bridge into another. We show where a voice came from, then leave the path open for someone else to add what they learned.</p><p>Zubaan is built for listening before collecting. No scores, no rush, no distance between the learner and the maker. When you hear something that stays with you, you can ask to learn directly — with care and consent.</p></div></div><div className="mt-20 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-primary p-6 text-primary-foreground"><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-primary-foreground/60">01 / listen</span><p className="mt-14 font-editorial text-3xl leading-none">The voice comes first.</p></div><div className="rounded-2xl border border-border bg-card p-6"><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground">02 / meet</span><p className="mt-14 font-editorial text-3xl leading-none">Learning is a relationship.</p></div><div className="rounded-2xl bg-secondary p-6"><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground">03 / continue</span><p className="mt-14 font-editorial text-3xl leading-none">A living archive stays open.</p></div></div><div className="mt-20 flex flex-col justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-center"><p className="font-editorial text-3xl">Have a voice to leave?</p><Link href="/record" className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[.14em] text-accent-foreground" data-testid="link-about-record">Make a recording <ArrowRight size={15} /></Link></div></section></Shell>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/record" component={RecordPage} /><Route path="/capsule/:id" component={CapsulePage} /><Route path="/lineage/:id" component={LineagePage} /><Route path="/artisan-inbox" component={ArtisanInbox} /><Route path="/about" component={About} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;