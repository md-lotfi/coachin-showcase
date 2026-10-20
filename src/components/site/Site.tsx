import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import qrcode from "qrcode-generator";
import {
  ArrowRight, Check, ChevronLeft, ChevronRight, CreditCard, Database, Download, HardDrive, Languages,
  LayoutDashboard, Menu, Moon, Nfc, NotebookPen, QrCode, Receipt, Ticket, Timer, Activity, Sun, WifiOff,
  X, Users, CalendarCheck, Wallet, Plus, ShieldCheck, Smartphone, Coins, BadgeCheck,
} from "lucide-react";
import { DICT, LANGS, LANG_LABEL, LANG_PATH, type Lang, type Dict } from "@/i18n/dict";
import { playUrl, PLAY_BASE } from "@/lib/site";
import iconAsset from "@/assets/coachin-icon.png.asset.json";
import logoAsset from "@/assets/coachin-logo.png.asset.json";
import checkinEn from "@/assets/checkin_en.webp.asset.json";
import checkinFr from "@/assets/checkin_fr.webp.asset.json";
import checkinAr from "@/assets/checkin_ar.webp.asset.json";
import pinEn from "@/assets/pin_en.webp.asset.json";
import pinFr from "@/assets/pin_fr.webp.asset.json";
import pinAr from "@/assets/pin_ar.webp.asset.json";
import subEn from "@/assets/subscribe_en.webp.asset.json";
import subFr from "@/assets/subscribe_fr.webp.asset.json";
import subAr from "@/assets/subscribe_ar.webp.asset.json";
import gpEn from "@/assets/gplay_en.png.asset.json";
import gpFr from "@/assets/gplay_fr.png.asset.json";
import gpAr from "@/assets/gplay_ar.png.asset.json";

/** Authentic screenshots per language, in gallery order (kiosk, PIN, new subscriber). */
const SHOTS: Record<Lang, string[]> = {
  en: [checkinEn.url, pinEn.url, subEn.url],
  fr: [checkinFr.url, pinFr.url, subFr.url],
  ar: [checkinAr.url, pinAr.url, subAr.url],
};
const BADGE: Record<Lang, string> = { en: gpEn.url, fr: gpFr.url, ar: gpAr.url };
const SECTIONS = ["features", "how", "screens", "premium", "faq"] as const;

const arrow = "rtl:-scale-x-100";

export function Site({ lang }: { lang: Lang }) {
  const t = DICT[lang];
  const [section, setSection] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ids = ["top", "problem", ...SECTIONS, "offline", "download"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setSection(e.target.id === "top" ? undefined : e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t.skip}
      </a>
      <Header t={t} lang={lang} section={section} />
      <main id="main">
        <Hero t={t} lang={lang} />
        <Problem t={t} />
        <Features t={t} lang={lang} />
        <How t={t} />
        <Gallery t={t} lang={lang} />
        <Offline t={t} />
        <Premium t={t} lang={lang} />
        <Faq t={t} />
        <Final t={t} lang={lang} />
      </main>
      <Footer t={t} lang={lang} section={section} />
      <MobileBar t={t} lang={lang} />
    </div>
  );
}

/* ---------- shared bits ---------- */

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
      <span className="h-px w-6 bg-primary" aria-hidden />
      {children}
    </p>
  );
}

function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl rtl:leading-[1.3] rtl:tracking-normal ${className}`}>
      {children}
    </h2>
  );
}

function PlayBadge({ lang, t, className = "h-14" }: { lang: Lang; t: Dict; className?: string }) {
  return (
    <a
      href={playUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block shrink-0 rounded-xl transition-transform hover:-translate-y-0.5"
    >
      <img src={BADGE[lang]} alt={t.cta.badgeAlt} width={646} height={250} className={`${className} w-auto -my-[6%]`} />
    </a>
  );
}

function PlayButton({ lang, t, label, className = "" }: { lang: Lang; t: Dict; label?: string; className?: string }) {
  return (
    <a
      href={playUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_0_0_0_var(--glow)] transition hover:shadow-[0_0_28px_4px_var(--glow)] ${className}`}
    >
      <Download className="size-4" aria-hidden />
      {label ?? t.cta.short}
    </a>
  );
}

function Logo({ t, className = "h-10" }: { t: Dict; className?: string }) {
  return (
    <span className="inline-flex rounded-xl bg-logo-plate px-1.5 py-0.5">
      <img src={logoAsset.url} alt={t.logoAlt} width={640} height={376} className={`${className} w-auto`} />
    </span>
  );
}

function Phone({ src, alt, priority, className = "" }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative rounded-[2.4rem] border border-border bg-card p-2 shadow-2xl shadow-black/40 ${className}`}>
      <div className="absolute start-1/2 top-3.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-background/70 rtl:translate-x-1/2" aria-hidden />
      <img
        src={src}
        alt={alt}
        width={902}
        height={1920}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="block h-auto w-full rounded-[1.9rem]"
      />
    </div>
  );
}

/* ---------- header ---------- */

function LangSwitch({ lang, section, t }: { lang: Lang; section?: string; t: Dict }) {
  return (
    <nav aria-label={t.menu.language} className="flex items-center rounded-full border border-border p-0.5 text-sm">
      {LANGS.map((l) => (
        <Link
          key={l}
          to={LANG_PATH[l]}
          hash={section}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "page" : undefined}
          className={`inline-flex min-h-9 items-center rounded-full px-3 font-semibold transition-colors ${
            l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          } ${l === "ar" ? "font-arabic" : ""}`}
        >
          {LANG_LABEL[l]}
        </Link>
      ))}
    </nav>
  );
}

function ThemeToggle({ t }: { t: Dict }) {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("coachin-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.menu.theme}
      aria-pressed={!dark}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}

function Header({ t, lang, section }: { t: Dict; lang: Lang; section?: string | undefined }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <a href="#top" aria-label={t.menu.home} className="flex min-w-0 shrink-0 items-center">
          <Logo t={t} className="h-9 lg:h-11" />
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                section === s ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.nav[s]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <LangSwitch lang={lang} section={section} t={t} />
          </div>
          <div className="hidden sm:block">
            <ThemeToggle t={t} />
          </div>
          <PlayButton lang={lang} t={t} className="hidden sm:inline-flex" />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.menu.close : t.menu.open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </Container>
      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {SECTIONS.map((s) => (
              <a key={s} href={`#${s}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-muted">
                {t.nav[s]}
              </a>
            ))}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <LangSwitch lang={lang} section={section} t={t} />
              <ThemeToggle t={t} />
            </div>
            <PlayButton lang={lang} t={t} label={t.cta.download} className="mt-4 w-full" />
          </Container>
        </div>
      )}
    </header>
  );
}

/* ---------- hero ---------- */

function Hero({ t, lang }: { t: Dict; lang: Lang }) {
  const shots = SHOTS[lang];
  const chipIcons = [WifiOff, Nfc, Languages];
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 end-[-10%] h-[600px] w-[600px] rounded-full bg-glow blur-[120px]" />
      <Container className="relative grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="animate-rise min-w-0">
          <div className="mb-6 flex items-center gap-3">
            <img src={iconAsset.url} alt={t.iconAlt} width={256} height={256} className="size-12 rounded-2xl shadow-lg" />
            <span className="text-sm font-semibold text-muted-foreground">{t.hero.eyebrow}</span>
          </div>
          <h1 className="text-balance text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl rtl:leading-[1.3] rtl:tracking-normal">
            {t.hero.title.map((line, i) => (
              <span key={i} className={`block ${i === 2 ? "text-primary" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">{t.hero.lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PlayBadge lang={lang} t={t} className="h-[60px]" />
            <a href="#features" className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:border-primary">
              {t.cta.explore}
              <ArrowRight className={`size-4 transition-transform group-hover:translate-x-0.5 ${arrow}`} aria-hidden />
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {t.hero.chips.map((c, i) => {
              const I = chipIcons[i]!;
              return (
                <li key={c} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                  <I className="size-4 text-primary" aria-hidden />
                  <span dir={i === 2 ? "auto" : undefined}>{c}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <div className="relative mx-auto w-[64%] max-w-[330px]">
            <Phone src={shots[0]!} alt={t.hero.mainAlt} priority />
            {/* Illustrative tap animation — not a live connection to the app */}
            <div aria-hidden className="absolute -end-[22%] bottom-[30%] w-[46%] sm:-end-[26%]">
              <div className="relative">
                <span className="absolute inset-0 m-auto size-24 rounded-full border-2 border-primary animate-tap-ring" />
                <div className="animate-tap-card relative mx-auto flex aspect-[1.58] w-full flex-col justify-between rounded-xl border border-border bg-card p-2.5 shadow-xl">
                  <Nfc className="size-5 text-primary" />
                  <div className="h-1.5 w-2/3 rounded bg-muted" />
                </div>
              </div>
            </div>
            <div
              aria-hidden
              className="animate-pop-in absolute -start-[14%] top-[18%] flex items-center gap-2.5 rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-4" />
              </span>
              <span className="text-start leading-tight">
                <span className="block text-sm font-bold">{t.hero.tapLabel}</span>
                <span className="block text-xs text-muted-foreground">{t.hero.tapSub}</span>
              </span>
            </div>
          </div>
          <div className="absolute -start-2 bottom-[-6%] hidden w-[34%] max-w-[170px] -rotate-6 opacity-95 sm:block lg:start-0">
            <Phone src={shots[1]!} alt={t.hero.sideAlt} priority />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- problem ---------- */

function Problem({ t }: { t: Dict }) {
  const icons = [NotebookPen, Ticket, CalendarCheck, Receipt];
  return (
    <section id="problem" className="border-y border-border bg-card/50 py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Eyebrow>{t.problem.eyebrow}</Eyebrow>
          <H2>{t.problem.title}</H2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">{t.problem.answer}</p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
          {t.problem.items.map(([h, p], i) => {
            const I = icons[i]!;
            return (
              <li key={h} className="bg-background p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <I className="size-6 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-bold text-muted-foreground/60">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-bold">{h}</h3>
                <p className="mt-2 text-muted-foreground">{p}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/* ---------- features ---------- */

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((p) => (
        <li key={p} className="flex gap-3">
          <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="size-3" aria-hidden />
          </span>
          <span className="text-muted-foreground">{p}</span>
        </li>
      ))}
    </ul>
  );
}

function Features({ t, lang }: { t: Dict; lang: Lang }) {
  const shots = SHOTS[lang];
  const f = t.features;
  const gridIcons = [LayoutDashboard, Wallet, CreditCard, QrCode, Activity, Timer, HardDrive, Languages];
  return (
    <section id="features" className="py-20 lg:py-28">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <H2>{f.title}</H2>
        </div>

        {/* Story 1 */}
        <article className="mt-14 grid items-center gap-10 overflow-hidden rounded-[2rem] border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              <Nfc className="size-4" aria-hidden /> {f.attendance.tag}
            </span>
            <h3 className="mt-5 text-2xl font-extrabold leading-tight sm:text-4xl rtl:leading-snug">{f.attendance.title}</h3>
            <Bullets items={f.attendance.points} />
            <p className="mt-6 flex gap-2 rounded-2xl border border-border p-4 text-sm text-muted-foreground">
              <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden />
              {f.attendance.note}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[280px]">
            <div aria-hidden className="absolute inset-[-15%] rounded-full bg-glow blur-3xl" />
            <Phone src={shots[0]!} alt={t.hero.mainAlt} className="relative" />
          </div>
        </article>

        {/* Story 2 */}
        <article className="mt-6 grid items-center gap-10 overflow-hidden rounded-[2rem] border border-border p-6 sm:p-10 lg:grid-cols-[0.8fr_1fr] lg:p-14">
          <div className="relative order-last mx-auto w-full max-w-[280px] lg:order-first">
            <Phone src={shots[2]!} alt={t.screens.items[2]![1]} />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              <Users className="size-4" aria-hidden /> {f.membership.tag}
            </span>
            <h3 className="mt-5 text-2xl font-extrabold leading-tight sm:text-4xl rtl:leading-snug">{f.membership.title}</h3>
            <Bullets items={f.membership.points} />
          </div>
        </article>

        {/* Supporting grid */}
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {f.grid.map(([h, p], i) => {
            const I = gridIcons[i]!;
            return (
              <li key={h} className="group rounded-3xl border border-border p-6 transition-colors hover:border-primary/60">
                <I className="size-6 text-primary" aria-hidden />
                <h3 className="mt-5 font-bold">{h}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

/* ---------- how ---------- */

function How({ t }: { t: Dict }) {
  const icons = [Ticket, Users, Nfc];
  const ex = t.how.example;
  return (
    <section id="how" className="border-y border-border bg-card/50 py-20 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <Eyebrow>{t.how.eyebrow}</Eyebrow>
            <H2>{t.how.title}</H2>
          </div>
          {/* Illustrative example card */}
          <div aria-hidden className="w-full max-w-xs rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="font-bold">{ex.pack}</span>
              <BadgeCheck className="size-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{ex.detail}</p>
            <div className="mt-4 flex gap-1.5" dir="ltr">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm">
              <span className="font-bold">5</span> {ex.of} 8 · {ex.left}
            </p>
          </div>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {t.how.steps.map(([h, p], i) => {
            const I = icons[i]!;
            return (
              <li key={h} className="relative rounded-3xl border border-border bg-background p-7">
                <span className="text-6xl font-extrabold leading-none text-primary/25">{i + 1}</span>
                <I className="absolute end-7 top-7 size-6 text-primary" aria-hidden />
                <h3 className="mt-6 text-xl font-bold">{h}</h3>
                <p className="mt-2 text-muted-foreground">{p}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

/* ---------- gallery ---------- */

function Gallery({ t, lang }: { t: Dict; lang: Lang }) {
  const shots = SHOTS[lang];
  const [idx, setIdx] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);
  const n = shots.length;
  const rtl = lang === "ar";

  const go = (d: number) => setIdx((i) => (i === null ? i : (i + d + n) % n));

  useEffect(() => {
    if (idx === null) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx === null]);

  useEffect(() => {
    if (idx === null) triggerRef.current?.focus();
  }, [idx]);

  return (
    <section id="screens" className="py-20 lg:py-28">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{t.screens.eyebrow}</Eyebrow>
          <H2>{t.screens.title}</H2>
          <p className="mt-4 text-muted-foreground">{t.screens.hint}</p>
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {shots.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setIdx(i);
                }}
                aria-label={`${t.screens.open}: ${t.screens.items[i]![0]}`}
                className="group block w-full text-start"
              >
                <div className="mx-auto max-w-[300px] transition-transform group-hover:-translate-y-1">
                  <Phone src={src} alt={t.screens.items[i]![1]} />
                </div>
                <h3 className="mt-6 text-center text-lg font-bold">{t.screens.items[i]![0]}</h3>
                <p className="mx-auto mt-1 max-w-xs text-center text-sm text-muted-foreground">{t.screens.items[i]![1]}</p>
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {idx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.screens.items[idx]![0]}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/95 p-4 backdrop-blur"
          onClick={(e) => e.target === e.currentTarget && setIdx(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
            touchX.current = null;
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setIdx(null)}
            aria-label={t.screens.close}
            className="absolute end-4 top-4 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card"
          >
            <X className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t.screens.prev}
            className="absolute start-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card sm:start-8"
          >
            <ChevronLeft className={`size-5 ${arrow}`} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t.screens.next}
            className="absolute end-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card sm:end-8"
          >
            <ChevronRight className={`size-5 ${arrow}`} aria-hidden />
          </button>
          <figure className="flex max-h-full flex-col items-center">
            <img
              src={shots[idx]!}
              alt={t.screens.items[idx]![1]}
              width={902}
              height={1920}
              className="h-auto max-h-[80vh] w-auto max-w-[78vw] rounded-[1.75rem] border border-border"
            />
            <figcaption className="mt-4 text-center">
              <span className="font-bold">{t.screens.items[idx]![0]}</span>
              <span className="ms-2 text-sm text-muted-foreground">
                {idx + 1} {t.screens.counter} {n}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* ---------- offline ---------- */

function Offline({ t }: { t: Dict }) {
  const icons = [Database, WifiOff, HardDrive, ShieldCheck];
  return (
    <section id="offline" className="py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 rounded-[2rem] border border-border bg-card p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-14">
          <div>
            <Eyebrow>{t.offline.eyebrow}</Eyebrow>
            <H2 className="sm:text-4xl">{t.offline.title}</H2>
            <p className="mt-6 text-lg text-muted-foreground">{t.offline.lead}</p>
            <p className="mt-6 text-sm text-muted-foreground">* {t.offline.note}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {t.offline.points.map(([h, p], i) => {
              const I = icons[i]!;
              return (
                <li key={h} className="rounded-2xl border border-border bg-background p-5">
                  <I className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-4 font-bold">{h}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ---------- premium ---------- */

function Premium({ t, lang }: { t: Dict; lang: Lang }) {
  const icons = [X, Nfc, Coins];
  return (
    <section id="premium" className="relative overflow-hidden border-y border-border py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 start-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-glow blur-[120px]" />
      <Container className="relative text-center">
        <Eyebrow>{t.premium.eyebrow}</Eyebrow>
        <H2 className="mx-auto max-w-3xl">{t.premium.title}</H2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{t.premium.lead}</p>
        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 text-start md:grid-cols-3">
          {t.premium.perks.map(([h, p], i) => {
            const I = i === 0 ? Plus : icons[i]!;
            return (
              <li key={h} className="rounded-3xl border border-primary/30 bg-background/80 p-7 backdrop-blur">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <I className={`size-5 ${i === 0 ? "rotate-45" : ""}`} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-bold">{h}</h3>
                <p className="mt-1.5 text-muted-foreground">{p}</p>
              </li>
            );
          })}
        </ul>
        <p className="mx-auto mt-10 max-w-xl text-sm text-muted-foreground">{t.premium.plans}</p>
        <a
          href={playUrl(lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary px-6 font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t.premium.cta}
          <ArrowRight className={`size-4 ${arrow}`} aria-hidden />
        </a>
      </Container>
    </section>
  );
}

/* ---------- faq ---------- */

function Faq({ t }: { t: Dict }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>{t.faq.eyebrow}</Eyebrow>
          <H2>{t.faq.title}</H2>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {t.faq.items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-start text-lg font-semibold"
                  >
                    <span>{q}</span>
                    <Plus className={`size-5 shrink-0 text-primary transition-transform ${isOpen ? "rotate-45" : ""}`} aria-hidden />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen} className="pb-6 pe-10 text-muted-foreground">
                  {a}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ---------- final ---------- */

function Qr({ alt }: { alt: string }) {
  const svg = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(PLAY_BASE);
    q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }, []);
  return (
    <div role="img" aria-label={alt} className="size-36 rounded-2xl bg-[oklch(1_0_0)] p-3 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

function Final({ t, lang }: { t: Dict; lang: Lang }) {
  return (
    <section id="download" className="pb-28 pt-4 lg:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <img src={iconAsset.url} alt={t.iconAlt} width={256} height={256} loading="lazy" className="size-20 shrink-0 rounded-3xl shadow-xl sm:size-24" />
              <div>
                <h2 className="text-balance text-3xl font-extrabold leading-tight sm:text-5xl rtl:leading-snug">{t.final.title}</h2>
                <p className="mt-3 text-lg opacity-80">{t.final.lead}</p>
                <div className="mt-6">
                  <PlayBadge lang={lang} t={t} className="h-[60px]" />
                </div>
              </div>
            </div>
            <div className="hidden flex-col items-center gap-3 lg:flex">
              <Qr alt={t.final.qrAlt} />
              <span className="text-sm font-semibold">{t.final.scan}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer({ t, lang, section }: { t: Dict; lang: Lang; section?: string | undefined }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/50 pb-24 pt-14 lg:pb-14">
      <Container className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo t={t} className="h-12" />
          <p className="mt-4 font-semibold">
            CoachIn <span className="text-muted-foreground">{t.footer.by}</span> RayState
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.footer.desc}</p>
          <div className="mt-5">
            <LangSwitch lang={lang} section={section} t={t} />
          </div>
        </div>
        <nav aria-label={t.footer.sections}>
          <h2 className="text-sm font-bold">{t.footer.sections}</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s}`} className="hover:text-foreground">{t.nav[s]}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.footer.links}>
          <h2 className="text-sm font-bold">{t.footer.links}</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href={playUrl(lang)} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Google Play</a></li>
            <li><a href="https://raystate.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t.footer.site}</a></li>
            <li><a href="https://raystate.com/raystate_privacy_policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{t.footer.privacy}</a></li>
          </ul>
        </nav>
      </Container>
      <Container className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        © <span dir="ltr">{year}</span> RayState. {t.footer.rights}
      </Container>
    </footer>
  );
}

function MobileBar({ t, lang }: { t: Dict; lang: Lang }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
      <PlayButton lang={lang} t={t} label={t.cta.download} className="w-full" />
    </div>
  );
}
