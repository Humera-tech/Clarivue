
import {
  ArrowUpRight,
  BookOpen,
  FileSearch,
  FileText,
  History,
  MessageSquareText,
  Plus,
  Quote,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim()) return;

    navigate("/dashboard/ask", {
      state: { question: question.trim() },
    });
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 pb-10">
      {/* Welcome */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#D99B7F]/10 blur-3xl dark:bg-[#D99B7F]/[0.08]" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#A56F63] dark:text-[#D99B7F]">
              <span className="h-px w-7 bg-current" />
              Your research desk
            </p>

            <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl lg:text-[58px]">
              Make sense of
              <br />
              <span className="text-[#A56F63] dark:text-[#D99B7F]">
                what matters.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Welcome to your space for deeper thinking. Bring your documents
              together, ask better questions, and follow every answer back to
              its evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-500 sm:self-auto dark:border-white/[0.09] dark:bg-white/[0.03] dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D99B7F]" />
            Your workspace
          </div>
        </div>
      </section>

      {/* Main actions */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/[0.09] dark:bg-[#101F26] dark:shadow-none">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#A56F63]/10" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-36 w-36 rounded-full border border-[#A56F63]/10" />

          <div className="relative">
            <div className="mb-6 flex items-center gap-2 text-[#A56F63] dark:text-[#D99B7F]">
              <Sparkles size={17} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                Start exploring
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl">
              Start with a question.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Begin an investigation and explore the evidence behind your
              questions.
            </p>

            <form onSubmit={handleAsk} className="mt-7">
              <label htmlFor="dashboard-question" className="sr-only">
                Ask Clarivue a question
              </label>

              <div className="rounded-xl border border-slate-200 bg-[#F8F7F3] p-3 transition-colors focus-within:border-[#A56F63] dark:border-white/[0.1] dark:bg-[#0B171D]">
                <textarea
                  id="dashboard-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="What would you like to investigate?"
                  rows={3}
                  className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-white/[0.08]">
                  <span className="text-[11px] text-slate-400">
                    Start a new research session
                  </span>

                  <button
                    type="submit"
                    disabled={!question.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D99B7F] px-4 py-2.5 text-xs font-semibold text-[#0F3040] transition-all hover:bg-[#E5AD94] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ask Clarivue
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              AI answers and source citations will be available when the
              research pipeline is connected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/documents")}
          className="group flex min-h-[280px] flex-col items-start justify-between rounded-2xl border border-dashed border-slate-300 bg-[#ECEDE9]/60 p-6 text-left transition-all duration-300 hover:border-[#A56F63] hover:bg-[#EAD7CD]/30 sm:p-7 dark:border-white/[0.14] dark:bg-white/[0.025] dark:hover:border-[#D99B7F]/60 dark:hover:bg-[#D99B7F]/[0.04]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#A56F63] transition-transform group-hover:-translate-y-1 dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-[#D99B7F]">
            <UploadCloud size={22} strokeWidth={1.7} />
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
              Expand your knowledge
            </p>

            <h2 className="max-w-xs font-serif text-2xl leading-tight">
              Bring a document into focus.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Open your document workspace to add research, reports, and notes.
            </p>
          </div>

          <div className="mt-6 flex w-full items-center justify-between border-t border-slate-300/70 pt-4 text-xs text-slate-500 dark:border-white/[0.1] dark:text-slate-400">
            <span>PDF · DOCX · TXT</span>
            <span className="flex items-center gap-2 font-medium text-[#0F3040] dark:text-[#F3F4F4]">
              View documents
              <Plus size={15} />
            </span>
          </div>
        </button>
      </section>

      {/* Research and library shortcuts */}
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
        <div>
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Your library
            </p>
            <h2 className="font-serif text-2xl">Your research, in one place.</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Your documents and saved research will appear here when available.
            </p>
          </div>

          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-white/[0.09] dark:bg-[#101F26]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAD7CD]/50 text-[#A56F63] dark:bg-[#D99B7F]/10 dark:text-[#D99B7F]">
              <BookOpen size={22} strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 font-serif text-xl">
              Nothing here just yet.
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Your library is ready for your first document. Nothing will be
              displayed until you add actual content.
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard/documents")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#A56F63] transition-colors hover:text-[#874D42] dark:text-[#D99B7F] dark:hover:text-[#EABAA4]"
            >
              Open document library
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.09] dark:bg-[#101F26]">
          <div className="flex items-center gap-2 text-[#A56F63] dark:text-[#D99B7F]">
            <Quote size={16} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              Your workspace
            </span>
          </div>

          <h2 className="mt-6 font-serif text-2xl leading-snug">
            A clearer path from question to evidence.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Clarivue is designed to help you investigate information, connect
            findings to their sources, and understand how an answer is supported.
          </p>

          <div className="my-6 h-px bg-slate-200 dark:bg-white/[0.08]" />

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/evidence")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#D99B7F]/50 dark:border-white/[0.08] dark:hover:bg-white/[0.025]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAD7CD]/50 text-[#A56F63] dark:bg-[#D99B7F]/10 dark:text-[#D99B7F]">
                <FileSearch size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Evidence library</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Explore supporting sources
                </span>
              </span>
              <ArrowUpRight size={15} className="text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/history")}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#D99B7F]/50 dark:border-white/[0.08] dark:hover:bg-white/[0.025]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAD7CD]/50 text-[#A56F63] dark:bg-[#D99B7F]/10 dark:text-[#D99B7F]">
                <History size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Research history</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Return to saved investigations
                </span>
              </span>
              <ArrowUpRight size={15} className="text-slate-400" />
            </button>

            <div className="flex items-start gap-3 rounded-xl bg-[#D99B7F]/[0.07] p-4">
              <MessageSquareText
                size={17}
                className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
              />
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                Your workspace will grow with the documents and research you
                actually add.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
