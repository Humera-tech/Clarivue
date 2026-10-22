
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  FileText,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface StoredProfile {
  name?: string;
  email?: string;
  role?: string;
}

const searchPages = [
  {
    label: "Overview",
    description: "Your Clarivue workspace",
    path: "/dashboard",
    keywords: "home dashboard overview",
    icon: LayoutDashboard,
  },
  {
    label: "My Documents",
    description: "Open your document library",
    path: "/dashboard/documents",
    keywords: "documents files pdf docx txt uploads",
    icon: FolderOpen,
  },
  {
    label: "Ask Clarivue",
    description: "Start a research question",
    path: "/dashboard/ask",
    keywords: "ask question research ai analysis",
    icon: Sparkles,
  },
  {
    label: "Evidence Library",
    description: "Explore supporting evidence",
    path: "/dashboard/evidence",
    keywords: "evidence sources citations verification",
    icon: ShieldCheck,
  },
  {
    label: "Research History",
    description: "View your research history",
    path: "/dashboard/history",
    keywords: "history previous sessions saved research",
    icon: History,
  },
  {
    label: "Settings",
    description: "Manage your preferences",
    path: "/dashboard/settings",
    keywords: "settings profile theme account",
    icon: Settings,
  },
];

export default function Header({
  currentPage,
}: {
  currentPage: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<StoredProfile>({});

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dark = theme === "dark";

  useEffect(() => {
    function loadProfile() {
      try {
        const saved = localStorage.getItem("clarivue_profile");
        setProfile(saved ? JSON.parse(saved) : {});
      } catch {
        setProfile({});
      }
    }

    loadProfile();
    window.addEventListener("clarivue-profile-updated", loadProfile);

    return () => {
      window.removeEventListener("clarivue-profile-updated", loadProfile);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyboard(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearchOpen(true);
        setProfileOpen(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyboard);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setProfileOpen(false);
    setQuery("");
  }, [location.pathname]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return searchPages;

    return searchPages.filter((page) =>
      `${page.label} ${page.description} ${page.keywords}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  const name = profile.name?.trim() || "Your workspace";
  const email = profile.email?.trim() || "Clarivue account";

  const initials =
    profile.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CV";

  function openPage(path: string) {
    setSearchOpen(false);
    setProfileOpen(false);
    setQuery("");
    navigate(path);
  }

  function goToSettings() {
    openPage("/dashboard/settings");
  }

  function signOut() {
    localStorage.removeItem("clarivue_access_token");
    setProfileOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-[86px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0B191D]/95 sm:px-7 lg:left-[274px] lg:px-9">
      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-medium text-slate-700 dark:text-[#E3E8EB]">
            {currentPage}
          </span>
        </div>

        <span className="font-serif text-lg sm:hidden">Clarivue</span>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative flex flex-1 justify-end">
        <div className="relative w-full max-w-[550px]">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results.length > 0) {
                event.preventDefault();
                openPage(results[0].path);
              }
            }}
            placeholder="Search your workspace..."
            aria-label="Search Clarivue pages"
            aria-expanded={searchOpen}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-14 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] focus:bg-white dark:border-white/[0.09] dark:bg-[#102126] dark:text-[#F3F4F4] dark:placeholder:text-[#8FA4B0] dark:focus:bg-[#102126]"
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <X size={14} />
            </button>
          )}

          {!query && (
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 px-1.5 py-1 text-[10px] text-slate-400 dark:border-white/10 sm:flex">
              {navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl"} K
            </span>
          )}
        </div>

        {searchOpen && (
          <div className="absolute right-0 top-[54px] z-50 w-full max-w-[550px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#102126] dark:shadow-black/40">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/[0.08]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {query.trim() ? "Search results" : "Quick navigation"}
              </p>
              <span className="text-[10px] text-slate-400">
                {results.length} {results.length === 1 ? "page" : "pages"}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="max-h-[360px] overflow-y-auto p-2">
                {results.map((page) => {
                  const Icon = page.icon;
                  const active = location.pathname === page.path;

                  return (
                    <button
                      type="button"
                      key={page.path}
                      onClick={() => openPage(page.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-[#D99B7F]/10"
                          : "hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/10 text-[#A56F63] dark:text-[#D99B7F]">
                        <Icon size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-slate-800 dark:text-[#F3F4F4]">
                          {page.label}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                          {page.description}
                        </span>
                      </span>

                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-slate-400"
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-9 text-center">
                <Search
                  size={22}
                  className="mx-auto text-slate-400"
                />
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-[#F3F4F4]">
                  No matching pages
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Try searching for documents, evidence, history, or settings.
                  Document and research content search can be added when those
                  data sources are connected.
                </p>
              </div>
            )}

            <div className="border-t border-slate-200 px-4 py-2.5 dark:border-white/[0.08]">
              <p className="text-[10px] text-slate-400">
                Search currently covers workspace pages, not document contents.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
        title={`Switch to ${dark ? "light" : "dark"} mode`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-[#A0B1BD] dark:hover:bg-white/[0.06]"
      >
        {dark ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      {/* Profile menu */}
      <div className="relative shrink-0" ref={profileRef}>
        <button
          type="button"
          onClick={() => {
            setProfileOpen((value) => !value);
            setSearchOpen(false);
          }}
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-white/[0.05]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#464858] text-xs font-semibold text-white ring-1 ring-[#D99B7F]/40">
            {initials}
          </div>
          <ChevronDown
            size={15}
            className={`hidden text-slate-500 transition-transform sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#102126] dark:shadow-black/40">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#464858] text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-[#91A6B2]">
                    {email}
                  </p>
                </div>
              </div>

              <p className="mt-3 inline-flex rounded-full bg-[#D99B7F]/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#A56F63] dark:text-[#E7A88B]">
                {profile.role || "Clarivue member"}
              </p>
            </div>

            <div className="space-y-1 p-2">
              <button
                type="button"
                onClick={goToSettings}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-[#DCE4E8] dark:hover:bg-white/[0.05]"
              >
                <UserRound size={17} className="text-slate-400" />
                Profile & settings
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-[#DCE4E8] dark:hover:bg-white/[0.05]"
              >
                {dark ? (
                  <Sun size={17} className="text-slate-400" />
                ) : (
                  <Moon size={17} className="text-slate-400" />
                )}
                Switch to {dark ? "light" : "dark"} mode
              </button>

              <div className="my-1 border-t border-slate-200 dark:border-white/[0.08]" />

              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/[0.08]"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
