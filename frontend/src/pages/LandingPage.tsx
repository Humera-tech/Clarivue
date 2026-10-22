import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Check,
  FileSearch,
  FlaskConical,
  GraduationCap,
  Files,
  Menu,
  Moon,
  Play,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";

/* ───────────────────────── palette ───────────────────────── */

const palettes = {
  dark: {
    bg: "#070D11",
    panel: "#0C151A",
    panelAlt: "#111D23",
    line: "rgba(255,255,255,0.11)",
    text: "#EDEDEA",
    muted: "#A3AEB1",
    accent: "#D49A7E", // terracotta
    signal: "#E3B27A", // conflict highlight
    onAccent: "#1A0F0A",
    veil: "4,9,12",
  },
  light: {
    bg: "#F3F4F4",
    panel: "#FFFFFF",
    panelAlt: "#E8ECED",
    line: "rgba(15,48,64,0.15)",
    text: "#0F3040",
    muted: "#5E7480",
    accent: "#A5624A",
    signal: "#B7701F",
    onAccent: "#FFFFFF",
    veil: "243,244,244",
  },
};
type Palette = typeof palettes.dark;

/* ───────────────────────── content ───────────────────────── */

const scenarios = [
  {
    tab: "Operating costs",
    question: "Do these reports agree on how operating costs changed?",
    answer:
      "They point in opposite directions. The annual report describes operating expenditure falling year over year, while the quarterly review describes costs rising in the final period. The timeframes differ, so check how each document defines the period before treating this as a true conflict.",
    passages: [
      {
        source: "annual-report-2025.pdf",
        page: "p. 18",
        before: "Operating expenditure ",
        mark: "decreased by 12%",
        after: " compared with the previous financial year.",
      },
      {
        source: "financial-review-q4.pdf",
        page: "p. 7",
        before: "Total operating costs ",
        mark: "increased by 4.2%",
        after: " during the final reporting period.",
      },
    ],
  },
  {
    tab: "Remote learning",
    question: "Does remote learning improve academic performance?",
    answer:
      "The two studies report different results. One finds higher average test scores; the other finds no statistically significant change. Study populations and methods differ, so the disagreement may reflect context rather than error.",
    passages: [
      {
        source: "study-a.pdf",
        page: "p. 12",
        before: "Students in remote cohorts showed ",
        mark: "higher average test scores",
        after: " than in-person peers.",
      },
      {
        source: "study-b.pdf",
        page: "p. 9",
        before: "We observed ",
        mark: "no statistically significant improvement",
        after: " in assessment outcomes.",
      },
    ],
  },
];

const steps = [
  {
    title: "Bring your documents",
    text: "Drop PDFs into a collection. Clarivue reads each page and keeps track of where every passage lives.",
  },
  {
    title: "Ask in plain language",
    text: "Questions are answered from your documents only, and the answer says so when the evidence is thin.",
  },
  {
    title: "Open the source",
    text: "Every claim links back to the document and page it came from. Nothing in the answer is unverifiable.",
  },
  {
    title: "Compare what disagrees",
    text: "Passages that may conflict are placed side by side, so you can judge the difference yourself.",
  },
];

/* ───────────────────────── hooks ───────────────────────── */

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function useTypewriter(text: string, active: boolean, speed = 16) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!active) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return text.slice(0, n);
}

/* ───────────────────────── styles ───────────────────────── */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap');

.cv-display{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;letter-spacing:-0.01em}
.cv-body{font-family:'Inter',system-ui,sans-serif}
@keyframes cv-scrollline{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

@keyframes cv-rise{from{transform:translateY(105%)}to{transform:translateY(0)}}
@keyframes cv-fade{from{opacity:0}to{opacity:1}}
@keyframes cv-settle{from{opacity:0;transform:translateY(26px) rotate(var(--r0,0deg))}to{opacity:1;transform:translateY(0) rotate(var(--r1,0deg))}}
@keyframes cv-draw{to{stroke-dashoffset:0}}
@keyframes cv-drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes cv-ken{from{transform:scale(1)}to{transform:scale(1.05)}}
@keyframes cv-ping{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.4);opacity:0}}
@keyframes cv-grain{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-1%)}100%{transform:translate(0,0)}}
@keyframes cv-sheen{from{transform:translateX(-120%)}to{transform:translateX(220%)}}
@keyframes cv-blink{50%{opacity:0}}
@keyframes cv-twinkle{0%,100%{opacity:.3}50%{opacity:1}}
.cv-twinkle{animation:cv-twinkle 4s ease-in-out infinite;animation-delay:var(--d,0s)}

.cv-word{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em}
.cv-word>span{display:inline-block;animation:cv-rise 1s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0s)}
.cv-settle{animation:cv-settle 1.1s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0s)}
.cv-fade{animation:cv-fade 1.2s ease both;animation-delay:var(--d,0s)}
.cv-draw{stroke-dasharray:var(--len,600);stroke-dashoffset:var(--len,600);animation:cv-draw 1.6s cubic-bezier(.5,0,.2,1) forwards;animation-delay:var(--d,0s)}
.cv-drift{animation:cv-drift 7s ease-in-out infinite;animation-delay:var(--d,0s)}
.cv-ken{animation:cv-ken 26s ease-in-out infinite alternate}
.cv-grain{animation:cv-grain 1.2s steps(4) infinite}
.cv-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-0.12em;animation:cv-blink 1s steps(1) infinite}
.cv-btn{position:relative;overflow:hidden;isolation:isolate}
.cv-btn::after{content:"";position:absolute;inset:0;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:translateX(-120%);z-index:-1}
.cv-btn:hover::after{animation:cv-sheen .9s ease}
.cv-mark{background-image:linear-gradient(var(--m),var(--m));background-repeat:no-repeat;background-position:0 92%;background-size:0% .14em;transition:background-size 1s cubic-bezier(.5,0,.2,1)}
.cv-mark.on{background-size:100% .14em}
.cv-outline{-webkit-text-stroke:1px var(--s);color:transparent;transition:color .5s,-webkit-text-stroke-color .5s}
.cv-outline:hover{color:var(--s)}
.cv-focus:focus-visible{outline:2px solid var(--a);outline-offset:3px}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
  .cv-draw{stroke-dashoffset:0}
  .cv-mark{background-size:100% .14em}
}
`;

/* ───────────────────────── page ───────────────────────── */

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const c: Palette = dark ? palettes.dark : palettes.light;

  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // scroll progress bar + nav state
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      setScrolled(h.scrollTop > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const imgRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = imgRef.current;
    if (!el) return;
    const x = (e.clientX / window.innerWidth - 0.5) * -14;
    const y = (e.clientY / window.innerHeight - 0.5) * -10;
    el.style.transform = `translate(${x}px, ${y}px) scale(1.06)`;
  };

  const image = dark ? "/images/LandingPageDarkMode.png" : "/images/LandingPageLightMode.png";
  const cssVars = { "--a": c.accent } as React.CSSProperties;

  return (
    <main
      className="cv-body min-h-screen overflow-x-hidden transition-colors duration-500"
      style={{ ...cssVars, backgroundColor: c.bg, color: c.text }}
    >
      <style>{css}</style>

      {/* scroll progress */}
      <div
        ref={progressRef}
        className="fixed left-0 top-0 z-50 h-[2px] w-full origin-left"
        style={{ background: c.accent, transform: "scaleX(0)" }}
      />

      {/* ── Navigation ── */}
      <header
        className="fixed inset-x-0 top-0 z-40 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? `rgba(${c.veil},0.78)` : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled ? c.line : "transparent"}`,
        }}
      >
        <div className="mx-auto flex h-[84px] max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="cv-focus flex items-center gap-3" aria-label="Clarivue home">
            <Search size={30} strokeWidth={1.5} style={{ color: c.accent }} />
            <span className="cv-display text-[30px] leading-none">clarivue</span>
          </Link>

          <nav className="hidden items-center gap-10 text-[13px] lg:flex" style={{ color: c.muted }}>
            <a href="#features" className="cv-focus transition-colors hover:text-[var(--a)]">Features</a>
            <a href="#method" className="cv-focus transition-colors hover:text-[var(--a)]">How It Works</a>
            <a href="#about" className="cv-focus transition-colors hover:text-[var(--a)]">About</a>
          </nav>

          <div className="hidden items-center gap-6 sm:flex">
            <button
              onClick={() => setDark(!dark)}
              className="cv-focus flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:rotate-12"
              style={{ color: c.muted }}
              aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="cv-focus text-[13px] font-medium hover:text-[var(--a)]">Sign In</Link>
            <Link
              to="/signup"
              className="cv-btn cv-focus inline-flex items-center rounded-full px-7 py-3 text-[13px] font-semibold"
              style={{ background: c.accent, color: c.onAccent }}
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:hidden">
            <button onClick={() => setDark(!dark)} className="flex h-10 w-10 items-center justify-center" aria-label="Toggle appearance">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setMenu(!menu)} className="flex h-10 w-10 items-center justify-center" aria-label="Toggle navigation">
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menu && (
          <div className="flex flex-col gap-5 border-t px-6 py-6 text-base sm:hidden" style={{ background: c.panel, borderColor: c.line }}>
            <a href="#features" onClick={() => setMenu(false)}>Features</a>
            <a href="#method" onClick={() => setMenu(false)}>How It Works</a>
            <a href="#about" onClick={() => setMenu(false)}>About</a>
            <Link to="/login">Sign In</Link>
            <Link to="/signup" className="font-semibold" style={{ color: c.accent }}>Get Started</Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={onMove}
        className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
      >
        {/* image (clear, with gentle parallax + slow zoom) */}
        <div ref={imgRef} className="absolute inset-0 -z-30 transition-transform duration-700 ease-out" style={{ transform: "scale(1.06)" }}>
          <div className="cv-ken h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${image}")` }} />
        </div>
        {/* shading only where the text sits */}
        <div
          className="absolute inset-0 -z-20 transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, rgba(${c.veil},0.9) 0%, rgba(${c.veil},0.6) 34%, rgba(${c.veil},0.08) 62%, transparent 100%), linear-gradient(180deg, rgba(${c.veil},0.55) 0%, transparent 18%), linear-gradient(0deg, ${c.bg} 0%, transparent 16%)`,
          }}
        />
        <div className="absolute inset-0 -z-10 md:hidden" style={{ background: `rgba(${c.veil},0.55)` }} />

        {/* side tagline */}
        <p
          className="cv-fade absolute right-[6%] top-[17%] hidden text-[11px] uppercase leading-[2.1] tracking-[0.3em] xl:block"
          style={{ color: c.muted, ["--d" as string]: "2s" }}
        >
          Better<br />questions.<br />Deeper<br />insights.
        </p>

        <div className="mx-auto w-full max-w-[1360px] px-5 pb-28 pt-32 sm:px-8 lg:px-12">
          <div className="max-w-[580px]">
            <p
              className="cv-fade text-[11px] uppercase tracking-[0.3em]"
              style={{ color: c.accent, ["--d" as string]: "0.2s" }}
            >
              AI-powered document intelligence
            </p>

            <h1 className="cv-display mt-6 text-[clamp(40px,5.2vw,74px)] leading-[1.02]">
              <span className="cv-word"><span style={{ ["--d" as string]: "0.35s" }}>Every</span></span>{" "}
              <span className="cv-word"><span style={{ ["--d" as string]: "0.45s" }}>answer</span></span>
              <br />
              <span className="cv-word"><span style={{ ["--d" as string]: "0.6s" }}>needs</span></span>{" "}
              <span className="cv-word"><span style={{ ["--d" as string]: "0.75s", color: c.accent }}>evidence.</span></span>
            </h1>

            <p
              className="cv-fade mt-7 max-w-[420px] text-[15px] leading-7"
              style={{ color: c.muted, ["--d" as string]: "1.1s" }}
            >
              Clarivue helps you explore your documents, trace claims, and uncover what&rsquo;s real, with
              cited sources and transparent reasoning.
            </p>

            <div className="cv-fade mt-9 flex flex-wrap items-center gap-4" style={{ ["--d" as string]: "1.3s" }}>
              <Link
                to="/signup"
                className="cv-btn cv-focus inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold transition-all hover:gap-5"
                style={{ background: c.accent, color: c.onAccent }}
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <a
                href="#demo"
                className="cv-focus inline-flex items-center gap-3 rounded-full border px-7 py-3.5 text-sm font-medium transition-colors hover:border-[var(--a)] hover:text-[var(--a)]"
                style={{ borderColor: c.line }}
              >
                <Play size={14} /> Watch Demo
              </a>
            </div>

            <div className="mt-14 grid max-w-[520px] grid-cols-3">
              {[
                { icon: FileSearch, title: "Research", text: "Find relevant evidence" },
                { icon: Scale, title: "Compare", text: "Spot conflicting claims" },
                { icon: ShieldCheck, title: "Verify", text: "Trace answers to sources" },
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="cv-fade pr-3 sm:px-5 sm:first:pl-0"
                    style={{
                      ["--d" as string]: `${1.6 + idx * 0.18}s`,
                      borderLeft: idx === 0 ? "none" : `1px solid ${c.line}`,
                      paddingLeft: idx === 0 ? 0 : undefined,
                    }}
                  >
                    <Icon size={28} strokeWidth={1.3} style={{ color: c.accent }} />
                    <p className="mt-4 text-sm font-medium">{f.title}</p>
                    <p className="mt-1.5 text-xs leading-5" style={{ color: c.muted }}>{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* floating evidence canvas on the right */}
        <HeroCanvas c={c} />

        {/* scroll cue */}
        <a
          href="#features"
          className="cv-fade cv-focus absolute bottom-9 left-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] sm:left-8 lg:left-12"
          style={{ color: c.accent, ["--d" as string]: "2.2s" }}
        >
          <span className="relative block h-7 w-px overflow-hidden" style={{ background: c.line }}>
            <span className="absolute inset-0 block" style={{ background: c.accent, animation: "cv-scrollline 2.4s ease-in-out infinite" }} />
          </span>
          Scroll to explore
        </a>
      </section>

      {/* ── Features ── */}
      <Features c={c} />

      {/* ── Live demo ── */}
      <Demo c={c} />

      {/* ── Method (a real sequence) ── */}
      <Method c={c} />

      {/* ── Comparison ── */}
      <Compare c={c} />

      {/* ── Audience ── */}
      <Audience c={c} />

      {/* ── About ── */}
      <About c={c} />

      {/* ── FAQ ── */}
      <Faq c={c} />

      {/* ── Closing ── */}
      <section className="relative isolate overflow-hidden px-5 py-28 sm:px-8 lg:px-12 lg:py-40">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ background: c.accent, opacity: dark ? 0.14 : 0.18 }}
        />
        <div className="mx-auto max-w-[1100px] text-center">
          <h2 className="cv-display text-[clamp(30px,4.4vw,58px)] leading-[1.08]">
            An answer you can <span className="italic" style={{ color: c.accent }}>check</span>
            <br />
            is an answer you can use.
          </h2>
          <p className="mx-auto mt-6 max-w-[420px] text-[15px] leading-7" style={{ color: c.muted }}>
            Upload a few documents and ask the question you have been putting off.
          </p>
          <Link
            to="/signup"
            className="cv-btn cv-focus mt-10 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold transition-all hover:gap-5"
            style={{ background: c.accent, color: c.onAccent }}
          >
            Create your workspace <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-5 pb-8 pt-16 sm:px-8 lg:px-12" style={{ borderColor: c.line }}>
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Search size={26} strokeWidth={1.5} style={{ color: c.accent }} />
                <span className="cv-display text-[26px] leading-none">clarivue</span>
              </div>
              <p className="mt-5 max-w-[320px] text-sm leading-7" style={{ color: c.muted }}>
                Ask questions across your documents, follow the evidence, and see where sources disagree.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Product</p>
              <ul className="mt-5 space-y-3 text-sm" style={{ color: c.muted }}>
                <li><a href="#features" className="hover:text-[var(--a)]">Features</a></li>
                <li><a href="#demo" className="hover:text-[var(--a)]">Live example</a></li>
                <li><a href="#method" className="hover:text-[var(--a)]">How it works</a></li>
                <li><a href="#faq" className="hover:text-[var(--a)]">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Get started</p>
              <ul className="mt-5 space-y-3 text-sm" style={{ color: c.muted }}>
                <li><a href="#about" className="hover:text-[var(--a)]">About</a></li>
                <li><Link to="/login" className="hover:text-[var(--a)]">Sign in</Link></li>
                <li><Link to="/signup" className="hover:text-[var(--a)]">Create an account</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 flex flex-col justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center" style={{ borderColor: c.line, color: c.muted }}>
            <span>Every answer needs evidence.</span>
            <span>&copy; {new Date().getFullYear()} Clarivue. Built by Humera Mahreen.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────────────── demo ───────────────────────── */

function Demo({ c }: { c: Palette }) {
  const [ref, seen] = useInView<HTMLElement>(0.3);
  const [i, setI] = useState(0);
  const s = scenarios[i];
  const typed = useTypewriter(s.answer, seen, 14);
  const done = typed.length === s.answer.length;

  return (
    <section id="demo" ref={ref} className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="cv-display text-[clamp(28px,3.4vw,44px)] leading-[1.1]">
              Watch it find the <span className="italic" style={{ color: c.signal }}>disagreement</span>.
            </h2>
            <p className="mt-6 max-w-[400px] leading-8" style={{ color: c.muted }}>
              Pick a question. Clarivue answers from the passages below and tells you when they
              pull in different directions.
            </p>

            <div className="mt-9 flex flex-col items-start gap-2" role="tablist" aria-label="Example questions">
              {scenarios.map((x, idx) => (
                <button
                  key={x.tab}
                  role="tab"
                  aria-selected={idx === i}
                  onClick={() => setI(idx)}
                  className="cv-focus rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300"
                  style={{
                    background: idx === i ? c.accent : "transparent",
                    color: idx === i ? c.onAccent : c.text,
                    border: `1px solid ${idx === i ? c.accent : c.line}`,
                  }}
                >
                  {x.tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border" style={{ borderColor: c.line, background: c.panel }}>
            <div className="flex items-center gap-2 border-b px-5 py-3.5 text-xs" style={{ borderColor: c.line, color: c.muted }}>
              <Sparkles size={14} style={{ color: c.accent }} />
              Illustrative preview with sample content
            </div>

            <div className="p-6 sm:p-9">
              <p className="text-sm" style={{ color: c.muted }}>You asked</p>
              <p className="cv-display mt-2 text-[21px] leading-[1.25] sm:text-[25px]">{s.question}</p>

              <div className="mt-8 min-h-[148px] border-l-2 pl-5" style={{ borderColor: c.accent }}>
                <p className="text-[15px] leading-8">
                  {typed}
                  {!done && seen && <span className="cv-caret" style={{ background: c.accent }} />}
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {s.passages.map((p) => (
                  <article key={p.source} className="rounded-md border p-5" style={{ borderColor: c.line, background: c.panelAlt }}>
                    <p className="flex items-center justify-between text-[11px]" style={{ color: c.muted }}>
                      <span className="flex items-center gap-1.5"><Files size={12} />{p.source}</span>
                      <span style={{ color: c.accent }}>{p.page}</span>
                    </p>
                    <p className="mt-4 text-sm leading-7">
                      {p.before}
                      <span className={`cv-mark ${done ? "on" : ""}`} style={{ ["--m" as string]: c.signal }}>{p.mark}</span>
                      {p.after}
                    </p>
                  </article>
                ))}
              </div>

              <div
                className="mt-5 flex items-start gap-3 rounded-md p-4 text-xs leading-6 transition-all duration-700"
                style={{
                  background: c.panelAlt,
                  color: c.muted,
                  opacity: done ? 1 : 0,
                  transform: done ? "none" : "translateY(8px)",
                }}
              >
                <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: c.signal }} />
                A possible conflict is a reason to investigate, not proof that either source is wrong.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── method ───────────────────────── */

function Method({ c }: { c: Palette }) {
  const ref = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // the line fills as you scroll, and each step lights up when reached
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="method" ref={ref} className="border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-36" style={{ borderColor: c.line, background: c.panel }}>
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 className="cv-display text-[clamp(28px,3.4vw,44px)] leading-[1.1] lg:sticky lg:top-32 lg:self-start">
          From a pile of PDFs to a sourced answer.
        </h2>

        <div className="relative pl-10 sm:pl-14">
          <div className="absolute bottom-2 left-[11px] top-2 w-px sm:left-[15px]" style={{ background: c.line }}>
            <div ref={fillRef} className="w-full" style={{ background: c.accent, height: "0%" }} />
          </div>

          {steps.map((s, idx) => {
            const on = idx <= active;
            return (
              <div key={s.title} className="relative pb-16 last:pb-0">
                <span
                  className="absolute -left-10 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500 sm:-left-14 sm:h-8 sm:w-8"
                  style={{
                    background: on ? c.accent : c.panel,
                    borderColor: on ? c.accent : c.line,
                    boxShadow: on && idx === active ? `0 0 0 6px ${c.accent}26` : "none",
                  }}
                />
                <h3
                  className="cv-display text-[23px] leading-tight transition-opacity duration-500 sm:text-[28px]"
                  style={{ opacity: on ? 1 : 0.35 }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-3 max-w-[480px] leading-8 transition-opacity duration-500"
                  style={{ color: c.muted, opacity: on ? 1 : 0.35 }}
                >
                  {s.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ───────────────────────── shared bits ───────────────────────── */

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(22px)",
        transition: `opacity .8s ease ${delay}s, transform .8s cubic-bezier(.2,.8,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Head({ title, text, c }: { title: string; text?: string; c: Palette }) {
  return (
    <div className="mb-14 max-w-[620px]">
      <h2 className="cv-display text-[clamp(28px,3.4vw,44px)] leading-[1.1]">{title}</h2>
      {text && <p className="mt-5 text-[15px] leading-7" style={{ color: c.muted }}>{text}</p>}
    </div>
  );
}

/* ───────────────────────── features ───────────────────────── */

const featureList = [
  {
    icon: FileSearch,
    title: "Ask across documents",
    text: "Ask one question across your whole collection and get an answer built from the passages that matter.",
    points: ["Search by meaning, not just keywords", "Every answer cites document and page", "Says so when the evidence is thin"],
  },
  {
    icon: Scale,
    title: "Find conflicting claims",
    text: "Clarivue lines up statements on the same topic and shows where documents may disagree.",
    points: ["Claims matched by topic", "Marked as supporting, conflicting, complementary or inconclusive", "Original passages side by side"],
  },
  {
    icon: ShieldCheck,
    title: "Trace every answer",
    text: "Open the exact passage behind any statement and judge the evidence yourself.",
    points: ["Citations come from retrieved passages, never invented", "Excerpt, file and page in one click", "Conversation history keeps your trail"],
  },
];

function Features({ c }: { c: Palette }) {
  return (
    <section id="features" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Head
          c={c}
          title="Built to show its work."
          text="A summary is easy to write. Clarivue is designed so every statement can be checked against your own documents."
        />
        <div className="grid border-l border-t md:grid-cols-3" style={{ borderColor: c.line }}>
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.12} className="group relative border-b border-r p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: c.accent }} />
                <Icon size={30} strokeWidth={1.3} style={{ color: c.accent }} />
                <h3 className="cv-display mt-8 text-[26px] leading-tight">{f.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: c.muted }}>{f.text}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3">
                      <Check size={15} className="mt-1 shrink-0" style={{ color: c.accent }} />
                      <span style={{ color: c.muted }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── comparison ───────────────────────── */

const rows = [
  ["Where answers come from", "Can blend in outside knowledge", "Only the documents you upload"],
  ["Sources", "Often missing or hard to verify", "Document, page and excerpt for each claim"],
  ["When documents disagree", "Differences can get smoothed over", "Both passages shown side by side"],
  ["When evidence is thin", "May still sound confident", "Tells you the evidence is insufficient"],
];

function Compare({ c }: { c: Palette }) {
  return (
    <section className="border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32" style={{ borderColor: c.line }}>
      <div className="mx-auto max-w-[1240px]">
        <Head c={c} title="Not just another chatbot." text="A general assistant is good at fluent answers. Clarivue is built for answers you can verify." />
        <Reveal>
          <div className="overflow-x-auto">
            <div className="min-w-[640px] overflow-hidden rounded-lg border" style={{ borderColor: c.line, background: c.panel }}>
              <div className="grid grid-cols-[1fr_1.2fr_1.2fr] border-b px-6 py-4 text-sm font-medium" style={{ borderColor: c.line }}>
                <span />
                <span style={{ color: c.muted }}>A general chatbot</span>
                <span style={{ color: c.accent }}>Clarivue</span>
              </div>
              {rows.map(([k, a, b]) => (
                <div key={k} className="grid grid-cols-[1fr_1.2fr_1.2fr] items-start gap-4 border-b px-6 py-5 text-sm last:border-b-0" style={{ borderColor: c.line }}>
                  <span className="font-medium">{k}</span>
                  <span className="flex gap-2.5" style={{ color: c.muted }}><X size={15} className="mt-1 shrink-0 opacity-60" />{a}</span>
                  <span className="flex gap-2.5"><Check size={15} className="mt-1 shrink-0" style={{ color: c.accent }} />{b}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── audience ───────────────────────── */

const audience = [
  { icon: GraduationCap, title: "Students", text: "Review several papers for an assignment and keep track of where each point came from." },
  { icon: FlaskConical, title: "Researchers", text: "Compare findings across studies and spot results that don't line up." },
  { icon: Briefcase, title: "Professionals", text: "Dig through reports, policies and technical documents without reading every page." },
  { icon: Users, title: "Teams", text: "Give everyone one searchable place to find and compare what the documents say." },
];

function Audience({ c }: { c: Palette }) {
  return (
    <section className="border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32" style={{ borderColor: c.line, background: c.panel }}>
      <div className="mx-auto max-w-[1240px]">
        <Head c={c} title="Made for people who read a lot." />
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.title} delay={i * 0.1}>
                <Icon size={26} strokeWidth={1.3} style={{ color: c.accent }} />
                <h3 className="cv-display mt-5 text-[24px]">{a.title}</h3>
                <p className="mt-2 text-sm leading-7" style={{ color: c.muted }}>{a.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── about ───────────────────────── */

const principles = [
  ["Evidence first", "An answer is only as useful as the passages behind it, so every answer points back to them."],
  ["Transparent by design", "Citations are attached from the passages that were actually retrieved, not written by the model."],
  ["Honest about limits", "A citation shows where information came from. It doesn't prove the source is true."],
];
const stack = ["React + TypeScript", "FastAPI", "PostgreSQL", "Chroma", "Sentence Transformers", "RAG"];

function About({ c }: { c: Palette }) {
  return (
    <section id="about" className="border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32" style={{ borderColor: c.line }}>
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <Reveal>
          <h2 className="cv-display text-[clamp(28px,3.4vw,44px)] leading-[1.1]">About Clarivue</h2>
          <p className="mt-6 max-w-[500px] text-[15px] leading-8" style={{ color: c.muted }}>
            Important information is often spread across many PDFs: research papers, reports, policies and
            technical documents. Finding the right passage, comparing claims and tracing a conclusion back to its
            source takes time, and AI summaries don&rsquo;t always show their evidence.
          </p>
          <p className="mt-5 max-w-[500px] text-[15px] leading-8" style={{ color: c.muted }}>
            Clarivue uses retrieval-augmented generation to answer only from the documents you provide, cite the
            exact page, and flag passages that may conflict. It is an AI engineering project designed and built by
            Humera Mahreen.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {stack.map((t) => (
              <span key={t} className="rounded-full border px-4 py-1.5 text-xs" style={{ borderColor: c.line, color: c.muted }}>{t}</span>
            ))}
          </div>
        </Reveal>

        <div className="space-y-0">
          {principles.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.12} className="border-t py-8 first:pt-0 lg:first:border-t-0">
              <div style={{ borderColor: c.line }}>
                <h3 className="cv-display text-[26px]" style={{ color: i === 0 ? c.accent : c.text }}>{t}</h3>
                <p className="mt-3 max-w-[460px] text-sm leading-7" style={{ color: c.muted }}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── faq ───────────────────────── */

const faqs = [
  ["What kinds of files can I upload?", "PDFs with selectable text. Scanned PDFs need text recognition (OCR), which is planned for a later version."],
  ["Can Clarivue invent a citation?", "The model writes the answer, but citations are attached by the app from the passages it retrieved, so page numbers and file names come from your documents."],
  ["Does it tell me which source is right?", "No. It shows where sources appear to disagree and helps you compare methods, populations and context. The judgement stays with you."],
  ["Can the answers still be wrong?", "Yes. AI can misread or over-extend a passage, which is why every answer links to its evidence. Check the cited text before relying on it."],
  ["Who can see my documents?", "Your documents are tied to your account and only searched for your questions. To write an answer, relevant passages are sent to a hosted language model."],
];

function Faq({ c }: { c: Palette }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t px-5 py-24 sm:px-8 lg:px-12 lg:py-32" style={{ borderColor: c.line, background: c.panel }}>
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 className="cv-display text-[clamp(28px,3.4vw,44px)] leading-[1.1]">Questions, answered with sources of our own.</h2>
        <div>
          {faqs.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q} className="border-b" style={{ borderColor: c.line }}>
                <button
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="cv-focus flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-[15px] font-medium">{q}</span>
                  <Plus size={18} className="shrink-0 transition-transform duration-300" style={{ color: c.accent, transform: on ? "rotate(135deg)" : "none" }} />
                </button>
                <div className="grid transition-all duration-500" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <p className="max-w-[560px] pb-6 text-sm leading-7" style={{ color: c.muted }}>{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── hero: floating evidence canvas ───────────────────────── */

const nodes = [
  { x: 70, y: 70, label: "p. 12", d: 1.0 },
  { x: 250, y: 34, label: "", d: 1.2 },
  { x: 470, y: 60, label: "p. 3", d: 1.4 },
  { x: 572, y: 170, label: "p. 18", d: 1.6 },
  { x: 580, y: 360, label: "", d: 1.8 },
  { x: 470, y: 500, label: "p. 21", d: 2.0 },
  { x: 230, y: 512, label: "", d: 2.2 },
  { x: 40, y: 420, label: "p. 9", d: 2.4 },
  { x: 22, y: 230, label: "", d: 2.5 },
];

const lines = [
  "M70 70 Q160 20 250 34",
  "M250 34 Q360 70 470 60",
  "M470 60 Q540 80 572 170",
  "M572 170 Q600 270 580 360",
  "M580 360 Q560 450 470 500",
  "M470 500 Q350 540 230 512",
  "M230 512 Q110 520 40 420",
  "M70 70 Q300 120 462 205",
  "M40 420 Q200 440 378 352",
  "M572 170 Q540 220 520 290",
  "M580 360 Q545 330 520 290",
];

function HeroCanvas({ c }: { c: Palette }) {
  const dark = c.bg === palettes.dark.bg;
  const clay = dark ? "#C9917A" : "#A5624A";
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLit(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const glass = {
    borderColor: dark ? "rgba(255,255,255,0.16)" : "rgba(15,48,64,0.14)",
    background: dark
      ? "linear-gradient(145deg, rgba(24,37,44,0.96), rgba(10,17,21,0.9))"
      : "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(244,247,247,0.92))",
    backdropFilter: "blur(20px) saturate(140%)",
    WebkitBackdropFilter: "blur(20px) saturate(140%)",
    boxShadow: dark
      ? "0 28px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.09)"
      : "0 24px 60px rgba(15,48,64,0.24), inset 0 1px 0 #fff",
  } as React.CSSProperties;

  const mark = (text: string) => (
    <span
      className={`cv-mark ${lit ? "on" : ""}`}
      style={{
        ["--m" as string]: clay,
        background: lit ? `${clay}44` : "transparent",
        transition: "background 1s ease, background-size 1s cubic-bezier(.5,0,.2,1)",
        padding: "0 3px",
        borderRadius: 3,
      }}
    >
      {text}
    </span>
  );

  return (
    <div
      className="absolute bottom-[7%] right-[4%] z-10 hidden aspect-[600/540] w-[min(44vw,600px)] xl:block"
      aria-hidden="true"
    >
      {/* constellation (behind the cards) */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 540" fill="none">
        {lines.map((d, i) => (
          <path
            key={d}
            d={d}
            className="cv-draw"
            stroke={c.accent}
            strokeWidth="1"
            opacity={dark ? 0.3 : 0.55}
            style={{ ["--len" as string]: 700, ["--d" as string]: `${1 + i * 0.18}s` }}
          />
        ))}
        {nodes.map((n) => (
          <g key={`${n.x}-${n.y}`} className="cv-twinkle" style={{ ["--d" as string]: `${n.d}s` }}>
            <circle cx={n.x} cy={n.y} r="7" fill={c.accent} opacity="0.12" />
            <circle cx={n.x} cy={n.y} r="2.4" fill={c.accent} />
            {n.label && (
              <text x={n.x + 10} y={n.y + 3} fontSize="10" fontWeight="500" fill={c.text} stroke={c.bg} strokeWidth="3" paintOrder="stroke" fontFamily="Inter, sans-serif">
                {n.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* card stack */}
      {/* back: faint context card */}
      <div className="absolute left-[4%] top-[4%] w-[58%]">
        <div className="cv-settle" style={{ ["--d" as string]: "1.1s", ["--r0" as string]: "-10deg", ["--r1" as string]: "-7deg" }}>
          <div className="cv-drift" style={{ ["--d" as string]: "-1s" }}>
            <div className="rounded-lg border p-5 opacity-90" style={glass}>
              <p className="flex items-center justify-between text-[11px] font-medium" style={{ color: c.muted }}>
                <span className="flex items-center gap-1.5"><Files size={11} /> regional-survey.pdf</span>
                <span>p. 4</span>
              </p>
              <div className="mt-4 space-y-2.5">
                {[92, 80, 66].map((w) => (
                  <div key={w} className="h-1.5 rounded-full" style={{ width: `${w}%`, background: dark ? "rgba(255,255,255,0.14)" : "rgba(15,48,64,0.14)" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* middle: first claim */}
      <div className="absolute left-[20%] top-[26%] w-[58%]">
        <div className="cv-settle" style={{ ["--d" as string]: "1.5s", ["--r0" as string]: "6deg", ["--r1" as string]: "3deg" }}>
          <div className="cv-drift" style={{ ["--d" as string]: "-3s" }}>
            <div className="rounded-lg border p-5" style={glass}>
              <p className="flex items-center justify-between text-[11px] font-medium" style={{ color: c.muted }}>
                <span className="flex items-center gap-1.5"><Files size={11} /> annual-report-2025.pdf</span>
                <span style={{ color: c.accent }}>p. 18</span>
              </p>
              <p className="mt-3 text-[13px] leading-6">
                Operating expenditure {mark("decreased by 12%")} compared with the previous financial year.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* front: conflicting claim */}
      <div className="absolute left-[6%] top-[56%] w-[58%]">
        <div className="cv-settle" style={{ ["--d" as string]: "1.9s", ["--r0" as string]: "-6deg", ["--r1" as string]: "-3deg" }}>
          <div className="cv-drift" style={{ ["--d" as string]: "-5s" }}>
            <div className="rounded-lg border p-5" style={glass}>
              <p className="flex items-center justify-between text-[11px] font-medium" style={{ color: c.muted }}>
                <span className="flex items-center gap-1.5"><Files size={11} /> financial-review-q4.pdf</span>
                <span style={{ color: c.accent }}>p. 7</span>
              </p>
              <p className="mt-3 text-[13px] leading-6">
                Total operating costs {mark("increased by 4.2%")} during the final reporting period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* connectors to the evidence marker (above the cards) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 540" fill="none">
        <path className="cv-draw" d="M462 205 C490 215 505 250 520 284" stroke={clay} strokeWidth="1.3" style={{ ["--len" as string]: 700, ["--d" as string]: "3.2s" }} />
        <path className="cv-draw" d="M378 352 C440 350 495 330 520 296" stroke={clay} strokeWidth="1.3" style={{ ["--len" as string]: 700, ["--d" as string]: "3.5s" }} />
        <g className="cv-fade" style={{ ["--d" as string]: "3.2s" }}>
          <circle cx="462" cy="205" r="3.2" fill={clay} />
          <circle cx="378" cy="352" r="3.2" fill={clay} />
        </g>
      </svg>

      {/* evidence marker */}
      <div
        className="cv-fade absolute"
        style={{ left: `${(520 / 600) * 100}%`, top: `${(290 / 540) * 100}%`, transform: "translate(-50%, -50%)", ["--d" as string]: "3.8s" }}
      >
        <span className="absolute inset-0 rounded-full" style={{ background: clay, animation: "cv-ping 2.6s ease-out infinite" }} />
        <span
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold"
          style={{ background: clay, color: "#0B0F12", boxShadow: `0 0 28px ${clay}66` }}
        >
          ≠
        </span>
        <span
          className="absolute left-1/2 top-[46px] -translate-x-1/2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-medium"
          style={{
            borderColor: dark ? "rgba(255,255,255,0.16)" : "rgba(15,48,64,0.16)",
            background: dark ? "#0E181D" : "#FFFFFF",
            color: c.text,
            boxShadow: dark ? "0 10px 24px rgba(0,0,0,0.5)" : "0 10px 24px rgba(15,48,64,0.2)",
          }}
        >
          Possible conflict · 2 sources
        </span>
      </div>
    </div>
  );
}