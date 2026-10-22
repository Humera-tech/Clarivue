
import { useState } from "react";
import {
  Search,
  LibraryBig,
  FileSearch,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EvidencePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      {/* Page heading */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#464858]/15 bg-[#F3F4F4] p-6 sm:p-10 dark:border-white/[0.08] dark:bg-[#0F3040]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D99B7F]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-[#A56F63]/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A56F63]/25 bg-[#A56F63]/10 px-3 py-1.5 text-xs font-medium tracking-wide text-[#A56F63] dark:text-[#D99B7F]">
            <LibraryBig size={14} />
            RESEARCH WORKSPACE
          </div>

          <h1 className="font-serif text-3xl leading-tight tracking-tight text-[#0F3040] sm:text-5xl dark:text-[#F3F4F4]">
            Evidence,{" "}
            <span className="italic text-[#A56F63] dark:text-[#D99B7F]">
              not assumptions.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300/75 sm:text-base">
            Every answer needs evidence. Explore the sources behind your
            research, trace supporting information, and keep your findings
            grounded in verifiable material.
          </p>
        </div>
      </section>

      {/* Evidence overview — actual empty state */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<LibraryBig size={19} />}
          label="Evidence sources"
          value="—"
          detail="No sources added yet"
        />
        <StatCard
          icon={<ShieldCheck size={19} />}
          label="Verified sources"
          value="—"
          detail="No verification results yet"
        />
        <StatCard
          icon={<FileSearch size={19} />}
          label="Claims supported"
          value="—"
          detail="No evidence linked yet"
        />
      </section>

      {/* Evidence collection */}
      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
            SOURCE MANAGER
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
            Evidence library
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Your supporting sources will appear here when evidence becomes
            available from your research.
          </p>
        </div>

        {/* Search UI, ready for real evidence data */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your evidence..."
              aria-label="Search evidence"
              className="w-full rounded-xl border border-[#464858]/15 bg-white px-11 py-3.5 text-sm text-[#0F3040] outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#464858]/30 dark:text-[#F3F4F4]"
            />

            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Honest empty state */}
        <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[#464858]/25 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-[#464858]/10 sm:py-20">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-[#D99B7F]/[0.07] blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D99B7F]/25 bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
            {search.trim() ? (
              <Search size={27} strokeWidth={1.5} />
            ) : (
              <FileSearch size={29} strokeWidth={1.5} />
            )}
          </div>

          <h3 className="relative mt-6 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
            {search.trim()
              ? "Nothing to search yet"
              : "Your evidence starts here"}
          </h3>

          <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
            {search.trim()
              ? "Your evidence library is empty, so there are no results to display. Upload a document and generate research before searching your evidence."
              : "Once you upload documents and Clarivue extracts supporting evidence from your research, your sources and linked findings will appear here."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard/documents")}
            className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#172A32] transition hover:bg-[#e6ae94] focus:outline-none focus:ring-2 focus:ring-[#D99B7F] focus:ring-offset-2 dark:focus:ring-offset-[#0F3040]"
          >
            <Upload size={17} />
            Go to documents
            <ArrowUpRight size={15} />
          </button>

          <p className="relative mt-4 text-xs text-slate-400">
            No sources have been added to this library yet.
          </p>
        </div>
      </section>

      {/* Product principle */}
      <section className="flex items-start gap-3 rounded-2xl border border-[#D99B7F]/20 bg-[#D99B7F]/[0.06] p-4 sm:p-5">
        <Sparkles
          size={18}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />
        <div>
          <p className="text-sm font-medium text-[#0F3040] dark:text-[#F3F4F4]">
            Evidence should be earned, not assumed.
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Clarivue should only display source references and verification
            results when they are backed by actual document content and
            completed analysis.
          </p>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#464858]/15 bg-white p-5 dark:border-white/[0.08] dark:bg-[#464858]/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#0F3040] dark:text-[#F3F4F4]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
