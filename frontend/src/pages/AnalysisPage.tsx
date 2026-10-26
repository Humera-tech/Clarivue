import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  Sparkles,
  FileText,
  ShieldCheck,
  History,
  SquarePen,
  BookOpen,
  ChevronDown,
  AlertCircle,
  RotateCcw,
  PanelLeft,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

const STORAGE_KEY = "clarivue.chats.v1";
const MAX_CHATS = 60;

const suggestions = [
  "What are the main findings in my research?",
  "Compare the key arguments across my documents.",
  "What evidence supports the main conclusion?",
  "Summarize the most important takeaways.",
];

type DocumentItem = {
  id: number;
  filename: string;
  status: string;
};

type DocumentListResponse =
  | DocumentItem[]
  | {
      items?: DocumentItem[];
      documents?: DocumentItem[];
    };

type SourceReference = {
  document_id: number;
  chunk_id: number;
  page_number: number;
  text: string;
};

type QuestionResponse = {
  question: string;
  answer: string;
  sources: SourceReference[];
};

type Turn = {
  id: string;
  question: string;
  documentId: string;
  documentName: string;
  status: "pending" | "done" | "error";
  answer?: QuestionResponse;
  error?: string;
};

type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: Turn[];
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeTitle(question: string) {
  const clean = question.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48).trimEnd()}…` : clean;
}

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return (parsed as Chat[]).map((chat) => ({
      ...chat,
      // a request that was in flight when the page closed can't finish
      turns: (chat.turns ?? []).map((turn) =>
        turn.status === "pending"
          ? {
              ...turn,
              status: "error" as const,
              error: "This request was interrupted. Edit and try again.",
            }
          : turn,
      ),
    }));
  } catch {
    return [];
  }
}

function groupLabel(timestamp: number) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const day = 24 * 60 * 60 * 1000;
  const diff = startOfToday.getTime() - timestamp;

  if (diff <= 0) return "Today";
  if (diff <= day) return "Yesterday";
  if (diff <= 7 * day) return "Previous 7 days";
  return "Older";
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function Avatar() {
  return (
    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D99B7F]/15 text-[#A56F63] ring-1 ring-[#D99B7F]/30 dark:text-[#D99B7F]">
      <Sparkles size={15} />
    </div>
  );
}

function TypingDots() {
  return (
    <div
      className="flex items-center gap-1.5 py-3"
      role="status"
      aria-label="Clarivue is thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-[#D99B7F]"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "1s" }}
        />
      ))}
      <span className="ml-2 text-xs text-slate-500 dark:text-[#91A6B2]">
        Reading your document
      </span>
    </div>
  );
}

function Sources({ sources }: { sources: SourceReference[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (sources.length === 0) {
    return (
      <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
        No supporting passages were returned for this answer.
      </p>
    );
  }

  const active = open !== null ? sources[open] : null;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#91A6B2]">
          <BookOpen size={14} />
          {sources.length} supporting passage
          {sources.length === 1 ? "" : "s"}
        </span>

        {sources.map((source, index) => {
          const isOpen = open === index;
          return (
            <button
              key={`${source.document_id}-${source.chunk_id}-${index}`}
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/50 ${
                isOpen
                  ? "border-[#D99B7F] bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]"
                  : "border-slate-200 text-slate-600 hover:border-[#D99B7F]/70 dark:border-white/10 dark:text-[#B7C4CB]"
              }`}
            >
              <FileText size={12} />
              Source {index + 1}, p. {source.page_number}
              <ChevronDown
                size={12}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {active && (
        <blockquote className="mt-3 rounded-r-xl border-l-2 border-[#D99B7F] bg-slate-50 py-3 pl-4 pr-4 dark:bg-[#081316]">
          <p className="mb-1.5 text-xs font-medium text-[#A56F63] dark:text-[#D99B7F]">
            Page {active.page_number}
          </p>
          <p className="whitespace-pre-wrap break-words font-serif text-sm leading-7 text-slate-700 dark:text-[#DDE3E6]">
            {active.text}
          </p>
        </blockquote>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AnalysisPage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [question, setQuestion] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentId, setDocumentId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [error, setError] = useState("");

  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeId) ?? null;
  const turns = activeChat?.turns ?? [];
  const isSubmitting = turns.some((turn) => turn.status === "pending");
  const isEmpty = turns.length === 0;

  const canSubmit =
    question.trim().length > 0 &&
    Boolean(documentId) &&
    !isSubmitting;

  /* ---------------- documents (unchanged) ---------------- */
  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoadingDocuments(true);
      setError("");

      try {
        const response = await apiRequest<DocumentListResponse>(
          "/documents?limit=100&offset=0",
          { authenticated: true },
        );

        const documentList = Array.isArray(response)
          ? response
          : response.items ?? response.documents ?? [];

        const processedDocuments = documentList.filter(
          (document) =>
            document.status?.toLowerCase() === "processed",
        );

        if (!cancelled) {
          setDocuments(processedDocuments);

          setDocumentId((currentId) => {
            if (
              currentId &&
              processedDocuments.some(
                (document) => String(document.id) === currentId,
              )
            ) {
              return currentId;
            }

            return processedDocuments.length > 0
              ? String(processedDocuments[0].id)
              : "";
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your documents.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  /* full-screen mode: stop the dashboard behind from scrolling */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats.slice(0, MAX_CHATS)),
      );
    } catch {
      /* storage full or unavailable: chat still works for this session */
    }
  }, [chats]);

  /* keep the newest message in view */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, activeId]);

  /* auto-growing composer */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`;
  }, [question]);

  /* ---------------- chat state helpers ---------------- */
  function patchChat(chatId: string, fn: (chat: Chat) => Chat) {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? fn(chat) : chat)),
    );
  }

  function patchTurn(chatId: string, turnId: string, patch: Partial<Turn>) {
    patchChat(chatId, (chat) => ({
      ...chat,
      updatedAt: Date.now(),
      turns: chat.turns.map((turn) =>
        turn.id === turnId ? { ...turn, ...patch } : turn,
      ),
    }));
  }

  function newChat() {
    setActiveId(null);
    setQuestion("");
    setError("");
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  function openChat(chat: Chat) {
    setActiveId(chat.id);
    setError("");
    setSidebarOpen(false);

    const last = chat.turns[chat.turns.length - 1];
    if (
      last &&
      documents.some((document) => String(document.id) === last.documentId)
    ) {
      setDocumentId(last.documentId);
    }
  }

  function deleteChat(chatId: string) {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeId === chatId) setActiveId(null);
    setConfirmDeleteId(null);
  }

  /* ---------------- ask (same request as before) ---------------- */
  async function submit() {
    const trimmed = question.trim();

    if (!trimmed || !documentId || isSubmitting) return;

    const now = Date.now();
    const turnId = makeId();
    const documentName =
      documents.find((d) => String(d.id) === documentId)?.filename ??
      "document";

    const turn: Turn = {
      id: turnId,
      question: trimmed,
      documentId,
      documentName,
      status: "pending",
    };

    let chatId = activeId;

    if (!chatId || !chats.some((chat) => chat.id === chatId)) {
      chatId = makeId();
      const created: Chat = {
        id: chatId,
        title: makeTitle(trimmed),
        createdAt: now,
        updatedAt: now,
        turns: [turn],
      };
      setChats((prev) => [created, ...prev]);
      setActiveId(chatId);
    } else {
      patchChat(chatId, (chat) => ({
        ...chat,
        updatedAt: now,
        turns: [...chat.turns, turn],
      }));
    }

    const targetChatId = chatId;

    setQuestion("");
    setError("");

    try {
      const response = await apiRequest<QuestionResponse>(
        "/questions/ask",
        {
          method: "POST",
          authenticated: true,
          body: JSON.stringify({
            document_id: Number(documentId),
            question: trimmed,
            top_k: 5,
          }),
        },
      );

      patchTurn(targetChatId, turnId, { status: "done", answer: response });
    } catch (err) {
      patchTurn(targetChatId, turnId, {
        status: "error",
        error:
          err instanceof Error
            ? err.message
            : "Unable to generate an answer. Please try again.",
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a new line
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  function pickSuggestion(text: string) {
    setQuestion(text);
    textareaRef.current?.focus();
  }

  function retry(turn: Turn) {
    if (!activeChat) return;

    if (activeChat.turns.length === 1) {
      deleteChat(activeChat.id);
    } else {
      patchChat(activeChat.id, (chat) => ({
        ...chat,
        turns: chat.turns.filter((t) => t.id !== turn.id),
      }));
    }

    setQuestion(turn.question);
    textareaRef.current?.focus();
  }

  /* ---------------- sidebar grouping ---------------- */
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { label: string; items: Chat[] }[] = [];
  for (const chat of sortedChats) {
    const label = groupLabel(chat.updatedAt);
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.items.push(chat);
    else groups.push({ label, items: [chat] });
  }

  /* ---------------- render ---------------- */
  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen overflow-hidden bg-white text-slate-900 dark:bg-[#091417] dark:text-[#F3F4F4]">
      {/* mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close chat history"
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}

      {/* ======================== History sidebar ======================== */}
      <aside
        className={`absolute inset-y-0 left-0 z-30 flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 dark:border-white/[0.08] dark:bg-[#081316] lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 pb-3 pt-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#D99B7F]/70 hover:text-[#A56F63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/40 dark:border-white/10 dark:text-[#B7C4CB] dark:hover:text-[#D99B7F]"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </button>

          <h1 className="font-serif text-2xl tracking-tight">
            Clarivue<span className="text-[#D99B7F]">.</span>
          </h1>

          <button
            type="button"
            onClick={newChat}
            className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-[#D99B7F]/50 bg-[#D99B7F]/10 px-3.5 py-2.5 text-sm font-semibold text-[#A56F63] transition hover:bg-[#D99B7F]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/50 dark:text-[#D99B7F]"
          >
            <SquarePen size={16} />
            New chat
          </button>
        </div>

        <nav
          aria-label="Chat history"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3"
        >
          {groups.length === 0 ? (
            <p className="px-3 py-6 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
              Your conversations will be saved here so you can come back to
              them.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-slate-400 dark:text-[#718894]">
                  {group.label}
                </p>

                <ul className="space-y-0.5">
                  {group.items.map((chat) => {
                    const isActive = chat.id === activeId;
                    const isConfirming = confirmDeleteId === chat.id;
                    const docName =
                      chat.turns[chat.turns.length - 1]?.documentName ?? "";

                    return (
                      <li key={chat.id} className="group relative">
                        {isConfirming ? (
                          <div className="flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2.5 dark:bg-red-950/20">
                            <span className="text-xs text-red-700 dark:text-red-300">
                              Delete this chat?
                            </span>
                            <span className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => deleteChat(chat.id)}
                                className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-white dark:border-white/10 dark:text-[#B7C4CB] dark:hover:bg-white/[0.04]"
                              >
                                Cancel
                              </button>
                            </span>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => openChat(chat)}
                              aria-current={isActive ? "true" : undefined}
                              className={`block w-full rounded-xl py-2.5 pl-3 pr-9 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/40 ${
                                isActive
                                  ? "bg-[#D99B7F]/15"
                                  : "hover:bg-slate-200/60 dark:hover:bg-white/[0.04]"
                              }`}
                            >
                              <span
                                className={`block truncate text-sm ${
                                  isActive
                                    ? "font-medium text-[#A56F63] dark:text-[#D99B7F]"
                                    : "text-slate-700 dark:text-[#DDE3E6]"
                                }`}
                              >
                                {chat.title}
                              </span>
                              {docName && (
                                <span className="mt-0.5 block truncate text-[11px] text-slate-400 dark:text-[#718894]">
                                  {docName}
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(chat.id)}
                              aria-label={`Delete chat: ${chat.title}`}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-100 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/40 dark:text-[#718894] dark:hover:bg-red-950/40 dark:hover:text-red-400 lg:opacity-0 lg:group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigate("/dashboard/documents")}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-[#A56F63] dark:text-[#B7C4CB] dark:hover:text-[#D99B7F]"
          >
            <FileText size={14} />
            Documents
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/history")}
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-[#A56F63] dark:text-[#B7C4CB] dark:hover:text-[#D99B7F]"
          >
            <History size={14} />
            Full history
          </button>
        </div>
      </aside>

      {/* ======================== Chat column ======================== */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/[0.08] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chat history"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#D99B7F]/70 hover:text-[#A56F63] dark:border-white/10 dark:text-[#B7C4CB] dark:hover:text-[#D99B7F] lg:hidden"
            >
              <PanelLeft size={16} />
            </button>
            <h2 className="truncate font-serif text-lg">
              {activeChat ? activeChat.title : "New chat"}
            </h2>
          </div>

          <div className="relative min-w-0 max-w-[260px] shrink">
            <FileText
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A56F63] dark:text-[#D99B7F]"
            />
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#718894]"
            />
            <label htmlFor="analysis-document" className="sr-only">
              Select a document
            </label>
            <select
              id="analysis-document"
              value={documentId}
              onChange={(event) => {
                setDocumentId(event.target.value);
                setError("");
              }}
              disabled={
                loadingDocuments ||
                documents.length === 0 ||
                isSubmitting
              }
              className="w-full appearance-none truncate rounded-full border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs font-medium outline-none transition focus:border-[#D99B7F] focus-visible:ring-2 focus-visible:ring-[#D99B7F]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0B191D] dark:text-[#F3F4F4]"
            >
              {loadingDocuments ? (
                <option value="">Loading documents...</option>
              ) : documents.length === 0 ? (
                <option value="">No processed documents</option>
              ) : (
                documents.map((document) => (
                  <option key={document.id} value={String(document.id)}>
                    {document.filename}
                  </option>
                ))
              )}
            </select>
          </div>
        </header>

        {/* messages */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-300/60 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-950/20"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Something went wrong
                  </h3>
                  <p className="mt-1 break-words text-sm leading-6 text-red-600 dark:text-red-300/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D99B7F]/15 text-[#A56F63] ring-1 ring-[#D99B7F]/30 dark:text-[#D99B7F]">
                  <Sparkles size={24} />
                </div>
                <h2 className="mt-6 font-serif text-3xl tracking-tight sm:text-4xl">
                  What are you curious about?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-[#9AADB8]">
                  Ask a question and I'll answer from your document, with the
                  passages that back it up.
                </p>

                {!loadingDocuments && documents.length === 0 && !error && (
                  <p className="mt-5 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-white/10 dark:text-[#91A6B2]">
                    No processed documents yet. Upload one and wait for
                    processing to finish.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/documents")}
                      className="font-semibold text-[#A56F63] hover:underline dark:text-[#D99B7F]"
                    >
                      Open documents
                    </button>
                  </p>
                )}

                <div className="mt-8 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => pickSuggestion(suggestion)}
                      disabled={isSubmitting}
                      className="rounded-2xl border border-slate-200 px-4 py-3.5 text-left text-sm leading-6 text-slate-700 transition hover:border-[#D99B7F]/70 hover:bg-[#D99B7F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/40 disabled:opacity-50 dark:border-white/[0.08] dark:text-[#DDE3E6] dark:hover:bg-white/[0.02]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {turns.map((turn, index) => {
                  const showDocument =
                    index === 0 ||
                    turns[index - 1].documentName !== turn.documentName;

                  return (
                    <div key={turn.id} className="space-y-5">
                      {/* user message */}
                      <div className="flex flex-col items-end">
                        {showDocument && (
                          <span className="mb-1.5 inline-flex max-w-[80%] items-center gap-1.5 text-[11px] text-slate-400 dark:text-[#718894]">
                            <FileText size={11} className="shrink-0" />
                            <span className="truncate">{turn.documentName}</span>
                          </span>
                        )}
                        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-md bg-[#D99B7F] px-5 py-3 text-sm leading-7 text-[#091417] sm:max-w-[75%]">
                          {turn.question}
                        </div>
                      </div>

                      {/* assistant message */}
                      <div className="flex gap-3">
                        <Avatar />
                        <div className="min-w-0 max-w-[92%] flex-1">
                          {turn.status === "pending" && <TypingDots />}

                          {turn.status === "error" && (
                            <div
                              role="alert"
                              className="rounded-2xl border border-red-300/60 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-950/20"
                            >
                              <div className="flex items-start gap-2.5">
                                <AlertCircle
                                  size={16}
                                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                                />
                                <p className="break-words text-sm leading-6 text-red-600 dark:text-red-300/90">
                                  {turn.error}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => retry(turn)}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-300/60 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-950/40"
                              >
                                <RotateCcw size={12} />
                                Edit and try again
                              </button>
                            </div>
                          )}

                          {turn.status === "done" && turn.answer && (
                            <article aria-live="polite">
                              <div className="whitespace-pre-wrap break-words pt-1 text-[15px] leading-8 text-slate-700 dark:text-[#DDE3E6]">
                                {turn.answer.answer}
                              </div>
                              <Sources sources={turn.answer.sources} />
                            </article>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:px-6">
          <form onSubmit={onSubmit}>
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm transition focus-within:border-[#D99B7F] focus-within:ring-4 focus-within:ring-[#D99B7F]/10 dark:border-white/10 dark:bg-[#0B191D] dark:shadow-none">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  documentId
                    ? "Ask something about your selected document..."
                    : "Select a processed document to start..."
                }
                rows={1}
                disabled={isSubmitting}
                aria-label="Your question"
                className="block max-h-44 min-h-[56px] w-full resize-none bg-transparent px-5 pb-1 pt-4 text-[15px] leading-7 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-slate-600"
              />

              <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
                <span className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-[#91A6B2]">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span className="truncate">
                    Answers grounded in document evidence
                  </span>
                </span>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-[11px] text-slate-400 dark:text-[#718894] md:inline">
                    Enter to send, Shift + Enter for a new line
                  </span>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    aria-label="Send question"
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D99B7F]/60 ${
                      canSubmit
                        ? "bg-[#D99B7F] text-[#091417] hover:brightness-105"
                        : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/[0.06] dark:text-[#718894]"
                    }`}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}