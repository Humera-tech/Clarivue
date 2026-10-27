
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  LibraryBig,
  FileSearch,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Upload,
  FileText,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(
    /\/$/,
    ""
  );

const PAGE_SIZE = 10;

type EvidenceItem = {
  id: number;
  document_id: number;
  document_name: string;
  page_number: number;
  text: string;
  created_at: string;
};

type EvidenceResponse = {
  total_evidence: number;
  total_documents: number;
  evidence: EvidenceItem[];
};

async function fetchEvidence(
  search: string,
  offset: number
): Promise<EvidenceResponse> {
  const token = localStorage.getItem("clarivue_access_token");

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/evidence/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let data: unknown = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorData = data as { detail?: unknown };

    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    throw new Error(
      typeof errorData.detail === "string"
        ? errorData.detail
        : "Unable to load evidence. Please try again."
    );
  }

  return data as EvidenceResponse;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EvidencePage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [result, setResult] = useState<EvidenceResponse>({
    total_evidence: 0,
    total_documents: 0,
    evidence: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchEvidence(
        debouncedSearch,
        page * PAGE_SIZE
      );

      setResult({
        total_evidence: data.total_evidence ?? 0,
        total_documents: data.total_documents ?? 0,
        evidence: Array.isArray(data.evidence) ? data.evidence : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your evidence."
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, refreshKey]);

  useEffect(() => {
    void loadEvidence();
  }, [loadEvidence]);

  const totalPages = Math.max(
    1,
    Math.ceil(result.total_evidence / PAGE_SIZE)
  );

  const visibleEvidence = useMemo(() => result.evidence, [result.evidence]);

  const hasSearch = debouncedSearch.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-12">
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
            Explore extracted passages from your documents, trace each
            passage to its source, and keep your research grounded in
            document content.
          </p>
        </div>
      </section>

      {/* Live statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<LibraryBig size={19} />}
          label="Evidence passages"
          value={loading && result.total_evidence === 0 ? "…" : result.total_evidence.toLocaleString()}
          detail="Stored document chunks"
        />

        <StatCard
          icon={<FileText size={19} />}
          label="Documents represented"
          value={loading && result.total_documents === 0 ? "…" : result.total_documents.toLocaleString()}
          detail="Processed documents with passages"
        />

        <StatCard
          icon={<ShieldCheck size={19} />}
          label="Verification status"
          value="Not available"
          detail="No verification checks recorded"
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
              SOURCE MANAGER
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
              Evidence library
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              {hasSearch
                ? `${result.total_evidence.toLocaleString()} matching passage${result.total_evidence === 1 ? "" : "s"}`
                : "Extracted passages with document and page references."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#464858]/15 px-4 py-2.5 text-sm transition hover:border-[#D99B7F] disabled:opacity-50 dark:border-white/10 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search evidence passages..."
            aria-label="Search evidence passages"
            className="w-full rounded-xl border border-[#464858]/15 bg-white px-11 py-3.5 text-sm text-[#0F3040] outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#464858]/30 dark:text-[#F3F4F4]"
          />

          <SlidersHorizontal
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/5 px-6 py-12 text-center">
            <AlertCircle size={28} className="mx-auto text-rose-500" />

            <h3 className="mt-4 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4]">
              We couldn't load your evidence
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="mt-5 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#172A32] transition hover:bg-[#e6ae94]"
            >
              Try again
            </button>
          </div>
        ) : loading && visibleEvidence.length === 0 ? (
          <div className="rounded-[24px] border border-[#464858]/15 bg-white/70 px-6 py-16 text-center dark:border-white/10 dark:bg-[#464858]/10">
            <LoaderCircle
              size={28}
              className="mx-auto animate-spin text-[#D99B7F]"
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading your evidence library...
            </p>
          </div>
        ) : visibleEvidence.length === 0 ? (
          <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[#464858]/25 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-[#464858]/10 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-[#D99B7F]/[0.07] blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D99B7F]/25 bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
              {hasSearch ? (
                <Search size={27} strokeWidth={1.5} />
              ) : (
                <FileSearch size={29} strokeWidth={1.5} />
              )}
            </div>

            <h3 className="relative mt-6 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
              {hasSearch
                ? "No matching evidence"
                : "Your evidence starts here"}
            </h3>

            <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
              {hasSearch
                ? "Try another search term to find a matching passage."
                : "No stored passages were found for your processed documents. Upload and process a document to populate this library."}
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
          </div>
        ) : (
          <div className="space-y-4">
            {visibleEvidence.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-[#464858]/15 bg-white p-5 transition hover:border-[#D99B7F]/50 dark:border-white/[0.08] dark:bg-[#464858]/15 sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
                      <FileText size={19} />
                    </span>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-[#0F3040] dark:text-[#F3F4F4]">
                        {item.document_name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Document #{item.document_id}
                        {" · "}
                        Page {item.page_number}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[#A56F63]/20 bg-[#A56F63]/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#A56F63] dark:text-[#D99B7F]">
                    <FileSearch size={12} />
                    Extracted passage
                  </span>
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 dark:text-slate-300/85">
                  {item.text}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#464858]/10 pt-4 text-xs text-slate-400 dark:border-white/[0.08]">
                  <span>Evidence #{item.id}</span>
                  <span>Added {formatDate(item.created_at)}</span>
                </div>
              </article>
            ))}

            <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {page * PAGE_SIZE + 1}–
                {page * PAGE_SIZE + visibleEvidence.length} of{" "}
                {result.total_evidence.toLocaleString()} passages
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#464858]/15 px-3 py-2 text-sm transition hover:border-[#D99B7F] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-2 text-xs text-slate-500 dark:text-slate-400">
                  {page + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page + 1 >= totalPages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages - 1, current + 1))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#464858]/15 px-3 py-2 text-sm transition hover:border-[#D99B7F] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

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
            This library displays extracted document passages. A passage being
            available does not by itself mean a claim has been independently
            verified or supported by a completed verification check.
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
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
          {icon}
        </span>
      </div>

      <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-[#0F3040] dark:text-[#F3F4F4]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
