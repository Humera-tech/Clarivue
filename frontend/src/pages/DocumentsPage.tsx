
import { useMemo, useRef, useState } from "react";
import {
  FileText,
  FileUp,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  File,
  Clock3,
  FolderOpen,
  Sparkles,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  status: "Pending upload";
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All files");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const accepted = Array.from(fileList)
      .filter((file) => /\.(pdf|docx|txt)$/i.test(file.name))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
        size: file.size,
        addedAt: new Date().toLocaleDateString(),
        status: "Pending upload" as const,
      }));

    setDocuments((current) => {
      const combined = [...current, ...accepted];
      return combined.filter(
        (item, index) =>
          combined.findIndex((other) => other.id === item.id) === index
      );
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  const visibleDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesQuery = document.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesType =
        filter === "All files" ||
        document.type.toLowerCase() === filter.toLowerCase();

      return matchesQuery && matchesType;
    });
  }, [documents, query, filter]);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-9 text-slate-900 dark:text-[#F3F4F4]">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A56F63] dark:text-[#D99B7F]">
            Your knowledge, organized
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            My Documents<span className="text-[#D99B7F]">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-[#9AADB8]">
            Bring your research together. Build a searchable library where
            every answer can lead back to its source.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#091417] transition hover:brightness-105"
        >
          <Plus size={17} />
          Add document
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`rounded-2xl border border-dashed p-8 text-center transition sm:p-12 ${
          dragging
            ? "border-[#D99B7F] bg-[#D99B7F]/10"
            : "border-slate-300 bg-white dark:border-white/15 dark:bg-[#0B191D]"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
          <FileUp size={25} />
        </div>
        <h2 className="mt-5 font-serif text-2xl">
          Bring a document into focus.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-[#9AADB8]">
          Drag and drop your files here, or browse your computer to select
          documents for your research.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#718894]">
          PDF · DOCX · TXT
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm transition hover:border-[#D99B7F] dark:border-white/10 dark:hover:border-[#D99B7F]"
        >
          Browse files
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0B191D]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-serif text-2xl">Your library</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
              {documents.length} selected file{documents.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#D99B7F] dark:border-white/10 sm:w-56"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#102126] sm:w-36"
              >
                <option>All files</option>
                <option>PDF</option>
                <option>DOCX</option>
                <option>TXT</option>
              </select>
            </div>
          </div>
        </div>

        {visibleDocuments.length === 0 ? (
          <div className="px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 dark:border-white/10 dark:text-[#718894]">
              {query || filter !== "All files" ? (
                <Search size={23} />
              ) : (
                <FolderOpen size={23} />
              )}
            </div>
            <h3 className="mt-5 font-serif text-xl">
              {query || filter !== "All files"
                ? "No matching documents"
                : "Your library starts here"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-[#91A6B2]">
              {query || filter !== "All files"
                ? "Try another search or choose a different file type."
                : "Add your first document to begin building your personal evidence library."}
            </p>
            {!query && filter === "All files" && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#A56F63] hover:underline dark:text-[#D99B7F]"
              >
                <Plus size={16} />
                Choose your first document
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/[0.07]">
            {visibleDocuments.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
                  <FileText size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-all text-sm font-medium">{document.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-[#91A6B2]">
                    <span>{document.type}</span>
                    <span>{formatSize(document.size)}</span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      Selected {document.addedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                    {document.status}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${document.name}`}
                    onClick={() =>
                      setDocuments((current) =>
                        current.filter((item) => item.id !== document.id)
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 px-4 py-4 dark:border-white/[0.07]">
        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-[#91A6B2]">
          Files selected here are currently held in page state only. They
          aren't uploaded or processed by the backend yet. We'll connect
          document uploads and indexing to your FastAPI endpoints next.
        </p>
      </div>
    </div>
  );
}
