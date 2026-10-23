
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  FileUp,
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  Clock3,
  FolderOpen,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  formatFileSize,
  formatDocumentDate,
  type DocumentItem,
} from "../services/documentService";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All files");
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [pageError, setPageError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    setLoading(true);
    setPageError("");

    try {
      const result = await getDocuments();
      setDocuments(result);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load your documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function uploadFiles(
    fileList: FileList | File[] | null
  ) {
    if (!fileList || fileList.length === 0 || uploading) {
      return;
    }

    const selectedFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const rejectedNames: string[] = [];

    setUploadError("");
    setUploadMessage("");

    for (const file of selectedFiles) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        rejectedNames.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (rejectedNames.length > 0) {
      setUploadError(
        `Unsupported file type: ${rejectedNames.join(
          ", "
        )}. Choose PDF, DOCX, or TXT files.`
      );
    }

    if (validFiles.length === 0) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setUploading(true);

    let successCount = 0;
    const failedNames: string[] = [];

    try {
      for (const file of validFiles) {
        try {
          const uploadedDocument = await uploadDocument(file);

          setDocuments((current) => {
            const withoutDuplicate = current.filter(
              (document) => document.id !== uploadedDocument.id
            );

            return [uploadedDocument, ...withoutDuplicate];
          });

          successCount += 1;
        } catch (error) {
          failedNames.push(
            `${file.name}: ${
              error instanceof Error
                ? error.message
                : "Upload failed."
            }`
          );
        }
      }

      if (successCount > 0) {
        setUploadMessage(
          `${successCount} document${
            successCount === 1 ? "" : "s"
          } uploaded successfully.`
        );
      }

      if (failedNames.length > 0) {
        setUploadError(
          [
            rejectedNames.length > 0
              ? `Unsupported files: ${rejectedNames.join(", ")}.`
              : "",
            ...failedNames,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      if (successCount > 0) {
        try {
          const latestDocuments = await getDocuments();
          setDocuments(latestDocuments);
        } catch {
          // Keep the successful upload records visible.
        }
      }
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleDeleteDocument(document: DocumentItem) {
    if (deletingId !== null || uploading) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${document.filename}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(document.id);
    setDeleteError("");
    setDeleteMessage("");

    try {
      await deleteDocument(document.id);

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );

      setDeleteMessage(
        `"${document.filename}" was deleted successfully.`
      );
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this document. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const visibleDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesQuery = document.filename
        .toLowerCase()
        .includes(normalizedQuery);

      const matchesType =
        filter === "All files" ||
        document.file_type.toLowerCase() === filter.toLowerCase();

      return matchesQuery && matchesType;
    });
  }, [documents, query, filter]);

  const openFilePicker = () => {
    if (!uploading && deletingId === null) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-9 text-slate-900 dark:text-[#F3F4F4]">
      {/* Page heading */}
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
          onClick={openFilePicker}
          disabled={uploading || deletingId !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#091417] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Plus size={17} />
          )}
          {uploading ? "Uploading..." : "Add document"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          disabled={uploading || deletingId !== null}
          className="hidden"
          onChange={(event) => {
            void uploadFiles(event.target.files);
          }}
        />
      </div>

      {/* Drag and drop */}
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!uploading && deletingId === null) {
            setDragging(true);
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);

          if (deletingId === null) {
            void uploadFiles(event.dataTransfer.files);
          }
        }}
        className={`rounded-2xl border border-dashed p-8 text-center transition sm:p-12 ${
          dragging
            ? "border-[#D99B7F] bg-[#D99B7F]/10"
            : "border-slate-300 bg-white dark:border-white/15 dark:bg-[#0B191D]"
        } ${uploading ? "opacity-70" : ""}`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
          {uploading ? (
            <LoaderCircle size={25} className="animate-spin" />
          ) : (
            <FileUp size={25} />
          )}
        </div>

        <h2 className="mt-5 font-serif text-2xl">
          {uploading
            ? "Bringing your document into focus..."
            : "Bring a document into focus."}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-[#9AADB8]">
          {uploading
            ? "Your selected files are being sent securely to your Clarivue backend."
            : "Drag and drop files here, or browse your computer to add documents to your research library."}
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-[#718894]">
          PDF · DOCX · TXT
        </p>

        <button
          type="button"
          disabled={uploading || deletingId !== null}
          onClick={openFilePicker}
          className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm transition hover:border-[#D99B7F] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:border-[#D99B7F]"
        >
          Browse files
        </button>
      </div>

      {/* Upload feedback */}
      {uploadMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{uploadMessage}</p>
        </div>
      )}

      {uploadError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="break-words">{uploadError}</p>
        </div>
      )}

      {/* Delete feedback */}
      {deleteMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{deleteMessage}</p>
        </div>
      )}

      {deleteError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="break-words">{deleteError}</p>
        </div>
      )}

      {/* Document library */}
      <section className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0B191D]">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-serif text-2xl">Your library</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
              {loading
                ? "Loading your library..."
                : `${documents.length} saved document${
                    documents.length === 1 ? "" : "s"
                  }`}
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
                aria-label="Search documents"
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
                aria-label="Filter documents by file type"
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#D99B7F] dark:border-white/10 dark:bg-[#102126] sm:w-36"
              >
                <option>All files</option>
                <option>PDF</option>
                <option>DOCX</option>
                <option>TXT</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadDocuments()}
              disabled={loading || uploading || deletingId !== null}
              aria-label="Refresh documents"
              title="Refresh documents"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-[#D99B7F] disabled:opacity-50 dark:border-white/10"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && documents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <LoaderCircle
              size={25}
              className="mx-auto animate-spin text-[#D99B7F]"
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-[#91A6B2]">
              Loading your documents...
            </p>
          </div>
        ) : pageError && documents.length === 0 ? (
          /* Load error */
          <div className="px-6 py-16 text-center">
            <AlertCircle
              size={25}
              className="mx-auto text-rose-500"
            />

            <h3 className="mt-4 font-serif text-xl">
              We couldn't load your library
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-[#91A6B2]">
              {pageError}
            </p>

            <button
              type="button"
              onClick={() => void loadDocuments()}
              className="mt-5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm transition hover:border-[#D99B7F] dark:border-white/10"
            >
              Try again
            </button>
          </div>
        ) : visibleDocuments.length === 0 ? (
          /* Empty state */
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
                onClick={openFilePicker}
                disabled={uploading || deletingId !== null}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#A56F63] hover:underline disabled:opacity-50 dark:text-[#D99B7F]"
              >
                <Plus size={16} />
                Choose your first document
              </button>
            )}
          </div>
        ) : (
          /* Real documents */
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
                  <p className="break-all text-sm font-medium">
                    {document.filename}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-[#91A6B2]">
                    <span>{document.file_type.toUpperCase()}</span>
                    <span>{formatFileSize(document.file_size)}</span>

                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      Added {formatDocumentDate(document.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={12} />
                    {document.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => void handleDeleteDocument(document)}
                    disabled={
                      deletingId !== null || uploading
                    }
                    aria-label={`Delete ${document.filename}`}
                    title="Delete document"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-rose-400"
                  >
                    {deletingId === document.id ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Current processing capabilities */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 px-4 py-4 dark:border-white/[0.07]">
        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-[#A56F63] dark:text-[#D99B7F]"
        />

        <p className="text-xs leading-5 text-slate-500 dark:text-[#91A6B2]">
          Your files are now saved through the Clarivue backend. Document
          text extraction, indexing, and evidence-based search are not
          connected yet. Those capabilities will be added in the next stages.
        </p>
      </div>
    </div>
  );
}
