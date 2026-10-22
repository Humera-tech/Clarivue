import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUp,
  Sparkles,
  FileText,
  ShieldCheck,
  MessageSquareText,
  Plus,
  Clock3,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const suggestions = [
  "What are the main findings in my research?",
  "Compare the key arguments across my documents.",
  "What evidence supports the main conclusion?",
  "Summarize the most important takeaways.",
];

export default function AskPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = question.trim().length > 0;

  function submit() {
    const trimmed = question.trim();
    if (!trimmed) return;

    // The next step will connect this to the FastAPI question-answering endpoint.
    navigate("/dashboard/history", { state: { question: trimmed } });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  // Ctrl/Cmd + Enter sends the question
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit();
    }
  }

  function pickSuggestion(text: string) {
    setQuestion(text);
    textareaRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-9 text-slate-900 dark:text-[#F3F4F4]">
      {/* Page header */}
      <header>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Ask Clarivue<span className="text-[#D99B7F]">.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-[#9AADB8]">
          Ask thoughtful questions. Explore connections. Trace your conclusions
          back to the documents that support them.
        </p>
      </header>

      {/* Composer — the main thing on this page */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-serif text-2xl leading-tight">
              What are you curious about?
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#91A6B2]">
              Start with a question in your own words.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-[#D99B7F] focus-within:ring-4 focus-within:ring-[#D99B7F]/10 dark:border-white/10 dark:bg-[#081316]">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something across your documents..."
              rows={9}
              className="block min-h-[280px] w-full resize-none bg-transparent px-5 pb-4 pt-5 text-base leading-8 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white/40 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.015] sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#91A6B2]">
                <ShieldCheck size={14} className="shrink-0" />
                Answers should be grounded in evidence
              </span>

              <div className="flex items-center gap-3">
                <span className="hidden text-[11px] text-slate-400 dark:text-[#718894] md:inline">
                  Ctrl + Enter to send
                </span>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    canSubmit
                      ? "bg-[#D99B7F] text-[#091417] hover:brightness-105"
                      : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/[0.06] dark:text-[#718894]"
                  }`}
                >
                  Ask Clarivue
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestions */}
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium text-slate-500 dark:text-[#91A6B2]">
            Need a starting point?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => pickSuggestion(suggestion)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3.5 text-left text-sm leading-6 text-slate-700 transition hover:border-[#D99B7F]/70 hover:bg-[#D99B7F]/5 dark:border-white/[0.08] dark:text-[#DDE3E6] dark:hover:bg-white/[0.02]"
              >
                {suggestion}
                <Plus
                  size={15}
                  className="shrink-0 text-slate-400 transition group-hover:text-[#A56F63] dark:group-hover:text-[#D99B7F]"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary info cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#0B191D]">
          <BookOpen size={19} className="text-[#A56F63] dark:text-[#D99B7F]" />
          <h3 className="mt-4 font-serif text-xl">Your sources</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
            Upload documents to give your questions a research context.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/documents")}
            className="mt-auto self-start pt-4 text-xs font-semibold text-[#A56F63] hover:underline dark:text-[#D99B7F]"
          >
            Open documents ↗
          </button>
        </article>

        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#0B191D]">
          <MessageSquareText
            size={19}
            className="text-[#A56F63] dark:text-[#D99B7F]"
          />
          <h3 className="mt-4 font-serif text-xl">Conversation history</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
            Return to earlier research questions and explorations.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/history")}
            className="mt-auto self-start pt-4 text-xs font-semibold text-[#A56F63] hover:underline dark:text-[#D99B7F]"
          >
            View history ↗
          </button>
        </article>

        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#0B191D]">
          <Clock3 size={19} className="text-[#A56F63] dark:text-[#D99B7F]" />
          <h3 className="mt-4 font-serif text-xl">Evidence matters</h3>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-[#91A6B2]">
            The goal is not just an answer, but a path back to its sources.
          </p>
        </article>
      </div>

      {/* Dev note — remove once the backend is connected */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 dark:border-white/[0.1]">
        <FileText
          size={16}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-[#91A6B2]">
          The question form is UI-only for now. It does not generate an AI
          answer yet; we'll connect it to your backend next.
        </p>
      </div>
    </div>
  );
}