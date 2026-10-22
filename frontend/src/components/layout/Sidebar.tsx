
import {
  BookOpenCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  ScanEye,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Documents", path: "/dashboard/documents", icon: FileText },
  { label: "Ask Clarivue", path: "/dashboard/ask", icon: MessageSquareText },
  { label: "Evidence Library", path: "/dashboard/evidence", icon: BookOpenCheck },
  { label: "History", path: "/dashboard/history", icon: Clock3 },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/70 bg-[#F8F7F3] text-[#0F3040] transition-colors dark:border-white/[0.08] dark:bg-[#0B171D] dark:text-[#F3F4F4]">
      <div className="flex h-24 items-center gap-3 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D99B7F] text-[#0F3040] shadow-sm">
          <ScanEye size={25} strokeWidth={1.8} />
        </div>

        <div>
          <h1 className="font-serif text-xl font-semibold tracking-[0.12em]">
            CLARIVUE
          </h1>
          <p className="mt-0.5 text-[10px] tracking-[0.08em] text-slate-500 dark:text-slate-400">
            EVERY ANSWER NEEDS EVIDENCE
          </p>
        </div>
      </div>

      <div className="px-5 pb-3 pt-5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#EAD7CD] text-[#0F3040] shadow-sm dark:bg-[#D99B7F]/15 dark:text-[#F2B89D]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-[#0F3040] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] transition-colors ${
              isActive
                ? "bg-[#EAD7CD] text-[#0F3040] dark:bg-[#D99B7F]/15 dark:text-[#F2B89D]"
                : "text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-white/[0.05]"
            }`
          }
        >
          <Settings size={18} strokeWidth={1.8} />
          Settings
        </NavLink>
      </div>

      <div className="mx-5 border-t border-slate-200 py-4 dark:border-white/[0.08]">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#464858] text-xs font-semibold text-white">
            CV
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Your workspace</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Researcher
            </p>
          </div>
          <ShieldCheck
            size={16}
            className="text-[#A56F63]"
            aria-label="Workspace"
          />
        </div>
      </div>
    </aside>
  );
}
