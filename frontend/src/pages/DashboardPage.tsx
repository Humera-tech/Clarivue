
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileSearch,
  FileText,
  History,
  MessageSquareText,
  Plus,
  RefreshCw,
  Sparkles,
  UploadCloud,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

interface DashboardStatistics {
  total_documents: number;
  processed_documents: number;
  processing_documents: number;
  failed_documents: number;
  total_chunks: number;
  recent_uploads_last_7_days: number;
}

interface DocumentItem {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

const emptyStatistics: DashboardStatistics = {
  total_documents: 0,
  processed_documents: 0,
  processing_documents: 0,
  failed_documents: 0,
  total_chunks: 0,
  recent_uploads_last_7_days: 0,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusStyles(status: string): string {
  switch (status.toLowerCase()) {
    case "processed":
    case "completed":
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

    case "processing":
    case "pending":
    case "queued":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    case "failed":
    case "error":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";

    default:
      return "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
  }
}

function displayStatus(status: string): string {
  if (!status) return "Unknown";

  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof FileText;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#0B191D]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-[#91A6B2]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-[#91A6B2]">
        {description}
      </p>
    </article>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [statistics, setStatistics] =
    useState<DashboardStatistics>(emptyStatistics);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [statsResult, documentsResult] = await Promise.all([
        apiRequest<DashboardStatistics>(
          "documents/dashboard/statistics",
          { authenticated: true }
        ),
        apiRequest<DocumentItem[]>("documents?limit=5&offset=0", {
          authenticated: true,
        }),
      ]);

      setStatistics(statsResult);
      setDocuments(documentsResult);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    navigate("/dashboard/ask", {
      state: { question: trimmedQuestion },
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-9 text-slate-900 dark:text-[#F3F4F4]">
      {/* Welcome header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
            <Sparkles size={14} />
            Your research workspace
          </p>

          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Make sense of what matters
            <span className="text-[#D99B7F]">.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-[#9AADB8]">
            Bring your documents together, ask meaningful questions, and trace
            your findings back to their evidence.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/documents")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-4 py-3 text-sm font-semibold text-[#091417] transition hover:brightness-105"
        >
          <UploadCloud size={17} />
          Upload documents
        </button>
      </header>

      {/* Dashboard loading error */}
      {loadError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-rose-500"
            />
            <div>
              <p className="text-sm font-medium">Could not load dashboard data</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#91A6B2]">
                {loadError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5 sm:self-center"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section aria-label="Document statistics">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">Your workspace</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
              An overview of your document library
            </p>
          </div>

          {loading && (
            <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#91A6B2]">
              <LoaderCircle size={14} className="animate-spin" />
              Updating
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total documents"
            value={statistics.total_documents}
            description="Documents in your library"
            icon={FileText}
          />

          <StatCard
            label="Processed"
            value={statistics.processed_documents}
            description="Documents processed successfully"
            icon={CheckCircle2}
          />

          <StatCard
            label="Total chunks"
            value={statistics.total_chunks}
            description="Document sections available for retrieval"
            icon={BookOpen}
          />

          <StatCard
            label="Uploaded this week"
            value={statistics.recent_uploads_last_7_days}
            description={`${statistics.processing_documents} processing · ${statistics.failed_documents} failed`}
            icon={Clock3}
          />
        </div>
      </section>

      {/* Ask Clarivue */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#D99B7F]/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="font-serif text-2xl">What matters to you?</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#91A6B2]">
                Start exploring your research with a question.
              </p>
            </div>
          </div>

          <form onSubmit={handleAsk} className="mt-6">
            <label htmlFor="dashboard-question" className="sr-only">
              Ask a question about your documents
            </label>

            <textarea
              id="dashboard-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask something across your documents..."
              rows={3}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] focus:ring-4 focus:ring-[#D99B7F]/10 dark:border-white/10 dark:bg-[#081316] dark:placeholder:text-slate-600"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#91A6B2]">
                <FileSearch size={15} />
                Every answer should lead back to its evidence.
              </p>

              <button
                type="submit"
                disabled={!question.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#091417] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ask Clarivue
                <ArrowUpRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Recent documents */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl">Recent documents</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
              Your latest additions to the research library
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/documents")}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#A56F63] hover:underline dark:text-[#D99B7F]"
          >
            View all documents
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0B191D]">
          {loading && documents.length === 0 ? (
            <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm text-slate-500 dark:text-[#91A6B2]">
              <LoaderCircle size={18} className="animate-spin" />
              Loading your documents...
            </div>
          ) : documents.length === 0 && !loadError ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
                <FileText size={25} />
              </div>

              <h3 className="mt-4 font-serif text-xl">
                Your library starts here
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-[#91A6B2]">
                Upload your first document to start building a research
                workspace grounded in your own sources.
              </p>

              <button
                type="button"
                onClick={() => navigate("/dashboard/documents")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D99B7F] px-4 py-2.5 text-sm font-semibold text-[#091417] transition hover:brightness-105"
              >
                <Plus size={16} />
                Add your first document
              </button>
            </div>
          ) : documents.length === 0 && loadError ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-[#91A6B2]">
              Your documents could not be retrieved. Retry to see the latest
              data.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">
                        {document.filename}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
                        {document.file_type.toUpperCase()} ·{" "}
                        {formatFileSize(document.file_size)} ·{" "}
                        {formatDate(document.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pl-[52px] sm:pl-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(document.status)}`}
                    >
                      {displayStatus(document.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shortcuts */}
      <section>
        <h2 className="mb-4 font-serif text-2xl">Continue exploring</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/documents")}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#D99B7F]/60 dark:border-white/[0.08] dark:bg-[#0B191D] dark:hover:bg-white/[0.025]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <BookOpen size={19} />
            </div>

            <div>
              <h3 className="font-serif text-xl">Document library</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
                Browse, upload, and manage your sources.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A56F63] dark:text-[#D99B7F]">
                Open library
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/evidence")}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#D99B7F]/60 dark:border-white/[0.08] dark:bg-[#0B191D] dark:hover:bg-white/[0.025]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <ShieldCheckIcon />
            </div>

            <div>
              <h3 className="font-serif text-xl">Evidence explorer</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
                Explore the sources behind your research.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A56F63] dark:text-[#D99B7F]">
                Explore evidence
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/history")}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#D99B7F]/60 dark:border-white/[0.08] dark:bg-[#0B191D] dark:hover:bg-white/[0.025]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <History size={19} />
            </div>

            <div>
              <h3 className="font-serif text-xl">Research history</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
                Return to earlier questions and explorations.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A56F63] dark:text-[#D99B7F]">
                View history
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Question answering is connected in the next step */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 dark:border-white/[0.1]">
        <MessageSquareText
          size={16}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-[#91A6B2]">
          Your document statistics and recent uploads are connected to the
          backend. The AI question-answering flow will be connected separately.
        </p>
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return <FileSearch size={19} />;
}
