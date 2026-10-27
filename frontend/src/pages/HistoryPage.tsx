
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  MessageSquareText,
  Clock3,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  FileSearch,
  Plus,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

type Conversation = {
  id: number;
  document_id: number | null;
  question: string;
  answer: string;
  created_at: string;
};

type FilterOption = "All research" | "Recent" | "With answers";

function getAccessToken(): string | null {
  return localStorage.getItem("clarivue_access_token");
}

async function conversationRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please sign in to view your research history.");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (response.status === 404) {
      throw new Error("This research session could not be found.");
    }

    let message = "Something went wrong while accessing your research.";

    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isRecent(value: string): boolean {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return timestamp >= sevenDaysAgo && timestamp <= Date.now();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred. Please try again.";
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("All research");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setSuccessMessage("");

    try {
      const data = await conversationRequest<Conversation[]>(
        "/conversations?limit=100&offset=0",
      );

      setConversations(
        [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const matchesSearch =
        !normalizedSearch ||
        conversation.question.toLowerCase().includes(normalizedSearch) ||
        conversation.answer.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "All research" ||
        (filter === "Recent" && isRecent(conversation.created_at)) ||
        (filter === "With answers" && Boolean(conversation.answer.trim()));

      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  const recentCount = useMemo(
    () => conversations.filter((item) => isRecent(item.created_at)).length,
    [conversations],
  );

  const handleDelete = async (conversation: Conversation) => {
    const confirmed = window.confirm(
      "Delete this saved research session? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(conversation.id);
    setError("");
    setSuccessMessage("");

    try {
      await conversationRequest<void>(`/conversations/${conversation.id}`, {
        method: "DELETE",
      });

      setConversations((previous) =>
        previous.filter((item) => item.id !== conversation.id),
      );

      if (expandedId === conversation.id) {
        setExpandedId(null);
      }

      setSuccessMessage("Research session deleted.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const clearSearchAndFilters = () => {
    setSearch("");
    setFilter("All research");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#464858]/15 bg-[#F3F4F4] p-6 sm:p-10 dark:border-white/[0.08] dark:bg-[#0F3040]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D99B7F]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-[#A56F63]/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#A56F63]/25 bg-[#A56F63]/10 px-3 py-1.5 text-xs font-medium tracking-wide text-[#A56F63] dark:text-[#D99B7F]">
              <History size={14} />
              YOUR WORKSPACE
            </div>

            <h1 className="font-serif text-3xl leading-tight tracking-tight text-[#0F3040] sm:text-5xl dark:text-[#F3F4F4]">
              Research,{" "}
              <span className="italic text-[#A56F63] dark:text-[#D99B7F]">
                remembered.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300/75 sm:text-base">
              Revisit your questions, return to previous investigations, and
              pick up where you left off. Your research journey belongs in one
              place.
            </p>
          </div>

          <div className="relative flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadHistory(true)}
              disabled={loading || refreshing}
              aria-label="Refresh research history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#464858]/15 px-4 py-3 text-sm font-medium text-[#0F3040] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-[#F3F4F4] dark:hover:bg-white/5"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/ask")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#172A32] transition hover:bg-[#e6ae94]"
            >
              <Plus size={17} />
              New research
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<History size={19} />}
          label="Research sessions"
          value={conversations.length.toLocaleString()}
          detail="Saved question-and-answer sessions"
        />

        <StatCard
          icon={<MessageSquareText size={19} />}
          label="Questions explored"
          value={conversations.length.toLocaleString()}
          detail="Each saved session records one question"
        />

        <StatCard
          icon={<Clock3 size={19} />}
          label="Recent activity"
          value={recentCount.toLocaleString()}
          detail="Sessions from the last 7 days"
        />
      </section>

      {/* History list */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
              YOUR ACTIVITY
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
              Research history
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Your saved questions and answers, all in one place.
            </p>
          </div>

          {!loading && conversations.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-[#0F3040] dark:text-[#F3F4F4]">
                {filteredConversations.length}
              </span>{" "}
              of {conversations.length} sessions
            </p>
          )}
        </div>

        {/* Search and filter */}
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
              placeholder="Search your questions and answers..."
              aria-label="Search research history"
              className="w-full rounded-xl border border-[#464858]/15 bg-white px-11 py-3.5 text-sm text-[#0F3040] outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#464858]/30 dark:text-[#F3F4F4]"
            />

            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <select
            aria-label="Filter research history"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as FilterOption)
            }
            className="rounded-xl border border-[#464858]/15 bg-white px-4 py-3.5 text-sm text-[#0F3040] outline-none focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#464858] dark:text-[#F3F4F4] sm:w-52"
          >
            <option>All research</option>
            <option>Recent</option>
            <option>With answers</option>
          </select>
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-500"
              />
              <p className="text-sm leading-6 text-red-600 dark:text-red-300">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadHistory(true)}
              className="shrink-0 self-start rounded-lg border border-red-500/20 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-300 sm:self-center"
            >
              Try again
            </button>
          </div>
        )}

        {successMessage && !error && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 size={17} />
            {successMessage}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-[24px] border border-[#464858]/15 bg-white/70 px-6 py-16 text-center dark:border-white/10 dark:bg-[#464858]/10">
            <RefreshCw
              size={26}
              className="mx-auto animate-spin text-[#A56F63] dark:text-[#D99B7F]"
            />
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Retrieving your research history...
            </p>
          </div>
        ) : conversations.length === 0 && !error ? (
          <EmptyState
            icon={<History size={29} strokeWidth={1.5} />}
            title="Your next question starts a journey"
            description="Once you research a document with Clarivue, your saved questions and answers will appear here."
            buttonLabel="Start researching"
            onAction={() => navigate("/dashboard/ask")}
          />
        ) : filteredConversations.length === 0 && !error ? (
          <EmptyState
            icon={<Search size={27} strokeWidth={1.5} />}
            title="No matching research"
            description="Try another search term or adjust your filter to find a previous investigation."
            buttonLabel="Clear search and filters"
            onAction={clearSearchAndFilters}
          />
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => {
              const isExpanded = expandedId === conversation.id;

              return (
                <article
                  key={conversation.id}
                  className="overflow-hidden rounded-[22px] border border-[#464858]/15 bg-white transition dark:border-white/[0.08] dark:bg-[#464858]/15"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A56F63]/20 bg-[#A56F63]/10 px-2.5 py-1 text-xs font-medium text-[#A56F63] dark:text-[#D99B7F]">
                            <MessageSquareText size={13} />
                            Research session
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock3 size={13} />
                            {formatDate(conversation.created_at)}
                          </span>
                        </div>

                        <h3 className="break-words font-serif text-xl leading-snug text-[#0F3040] dark:text-[#F3F4F4] sm:text-2xl">
                          {conversation.question}
                        </h3>

                        <p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-500 dark:text-slate-400">
                          {conversation.answer}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDelete(conversation)}
                        disabled={deletingId === conversation.id}
                        aria-label="Delete research session"
                        title="Delete session"
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-500/15 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-500/[0.06] disabled:opacity-50 dark:text-red-300"
                      >
                        <Trash2 size={14} />
                        {deletingId === conversation.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#464858]/10 pt-4 dark:border-white/[0.08]">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <FileSearch size={14} />
                        {conversation.document_id !== null
                          ? `Document #${conversation.document_id}`
                          : "Document no longer linked"}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : conversation.id)
                        }
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#A56F63] transition hover:bg-[#D99B7F]/10 dark:text-[#D99B7F]"
                      >
                        {isExpanded ? "Hide answer" : "Read full answer"}
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 rounded-2xl border border-[#D99B7F]/20 bg-[#D99B7F]/[0.05] p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A56F63] dark:text-[#D99B7F]">
                          CLARIVUE&apos;S ANSWER
                        </p>

                        <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#0F3040] dark:text-[#F3F4F4]">
                          {conversation.answer}
                        </div>

                        <p className="mt-4 border-t border-[#D99B7F]/20 pt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          This is the saved answer from your original research
                          session.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer note */}
      <section className="flex items-start gap-3 rounded-2xl border border-[#D99B7F]/20 bg-[#D99B7F]/[0.06] p-4 sm:p-5">
        <Sparkles
          size={18}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />

        <div>
          <p className="text-sm font-medium text-[#0F3040] dark:text-[#F3F4F4]">
            Every investigation should have a trail.
          </p>

          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
            Your saved questions and answers are retrieved from your Clarivue
            account. Search and filters apply to the sessions currently loaded
            on this page.
          </p>
        </div>
      </section>
    </main>
  );
}

function EmptyState({
  icon,
  title,
  description,
  buttonLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-dashed border-[#464858]/25 bg-white/70 px-6 py-14 text-center dark:border-white/15 dark:bg-[#464858]/10 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-[#D99B7F]/[0.07] blur-3xl" />

      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D99B7F]/25 bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
        {icon}
      </div>

      <h3 className="relative mt-6 font-serif text-2xl text-[#0F3040] dark:text-[#F3F4F4] sm:text-3xl">
        {title}
      </h3>

      <p className="relative mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="relative mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#172A32] transition hover:bg-[#e6ae94] focus:outline-none focus:ring-2 focus:ring-[#D99B7F] focus:ring-offset-2 dark:focus:ring-offset-[#0F3040]"
      >
        <MessageSquareText size={17} />
        {buttonLabel}
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
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

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#0F3040] dark:text-[#F3F4F4]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
