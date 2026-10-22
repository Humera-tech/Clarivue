
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  FolderOpen,
  History,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import Header from "./Header";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "My Documents", path: "/dashboard/documents", icon: FolderOpen },
  { label: "Ask Clarivue", path: "/dashboard/ask", icon: Sparkles },
  { label: "Evidence Library", path: "/dashboard/evidence", icon: ShieldCheck },
  { label: "History", path: "/dashboard/history", icon: History },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const currentPage =
    navigation.find(
      (item) =>
        item.path === location.pathname &&
        (item.end || location.pathname === item.path)
    )?.label ||
    (location.pathname === "/dashboard/settings" ? "Settings" : "Workspace");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[86px] shrink-0 items-center gap-3 border-b border-slate-200/70 px-6 dark:border-white/[0.07]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F] text-[#0B191D]">
          <BookOpen size={23} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p className="font-serif text-[23px] font-semibold tracking-[0.04em] text-slate-900 dark:text-[#F3F4F4]">
            CLARIVUE
          </p>
          <p className="mt-0.5 max-w-[145px] text-[9px] uppercase leading-4 tracking-[0.12em] text-slate-500 dark:text-[#A2B1BC]">
            Every answer needs evidence
          </p>
        </div>
      </div>

      <div className="px-3.5 pt-8">
        <p className="mb-4 px-4 text-[10px] font-medium uppercase tracking-[0.23em] text-slate-400 dark:text-[#78909D]">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] transition-colors duration-200 ${
                  isActive
                    ? "bg-[#D99B7F]/15 font-medium text-[#9D6250] dark:bg-[#D99B7F]/15 dark:text-[#E7A88B]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-[#A0B1BD] dark:hover:bg-white/[0.045] dark:hover:text-[#F3F4F4]"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-[#102126]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-[#D99B7F]" />
            <p className="text-xs font-medium text-slate-800 dark:text-[#F3F4F4]">
              Evidence first.
            </p>
          </div>

          <p className="text-xs leading-5 text-slate-500 dark:text-[#9AADB8]">
            Keep your research organized and your answers grounded in sources.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-[#A0B1BD] dark:hover:bg-white/[0.05] dark:hover:text-white"
        >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-slate-900 transition-colors duration-300 dark:bg-[#091417] dark:text-[#F3F4F4]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[274px] border-r border-slate-200/80 bg-white dark:border-white/[0.07] dark:bg-[#0B191D] lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B191D]">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={19} />
            </button>

            {sidebar}
          </aside>
        </div>
      )}

      {/* Extracted header */}
      <Header currentPage={currentPage} />

      {/* Page content */}
      <main className="fixed bottom-0 left-0 right-0 top-[86px] overflow-y-auto overscroll-contain bg-[#F7F7F5] dark:bg-[#091417] lg:left-[274px]">
        <div className="min-h-full px-5 pb-12 pt-2 sm:px-8 lg:px-10">
          {/* Mobile menu button */}
          <div className="mb-4 flex items-center lg:hidden">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-white/[0.09] dark:bg-[#101F26] dark:text-slate-300"
            >
              <Menu size={16} />
              Menu
            </button>
          </div>

          <Outlet />
        </div>

        <footer className="px-5 pb-6 text-center text-[10px] tracking-[0.16em] text-slate-400 dark:text-[#607985] sm:px-8 lg:px-10">
          CLARIVUE · EVERY ANSWER NEEDS EVIDENCE
        </footer>
      </main>
    </div>
  );
}
