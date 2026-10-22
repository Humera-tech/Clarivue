
import { useEffect, useState, type FormEvent } from "react";
import {
  UserRound,
  Palette,
  ShieldCheck,
  Save,
  Sun,
  Moon,
  Check,
  Mail,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface Profile {
  name: string;
  email: string;
  role: string;
}

const emptyProfile: Profile = {
  name: "",
  email: "",
  role: "Researcher",
};

function getStoredProfile(): Profile {
  let stored: Record<string, unknown> = {};

  try {
    const saved = localStorage.getItem("clarivue_profile");
    if (saved) stored = JSON.parse(saved);
  } catch {
    stored = {};
  }

  // Support common user/profile keys if your login flow already saves one.
  for (const key of ["clarivue_user", "user", "currentUser"]) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          stored = { ...parsed, ...stored };
        }
      }
    } catch {
      // Continue checking other possible profile keys.
    }
  }

  let tokenClaims: Record<string, unknown> = {};

  try {
    const token = localStorage.getItem("clarivue_access_token");
    if (token) {
      const payload = token.split(".")[1];
      if (payload) {
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        tokenClaims = JSON.parse(atob(normalized));
      }
    }
  } catch {
    // The token may not contain readable profile claims.
  }

  const firstString = (...values: unknown[]) =>
    values.find((value) => typeof value === "string" && value.trim()) as
      | string
      | undefined;

  const tokenEmail = firstString(tokenClaims.email);
  const subject = firstString(tokenClaims.sub);

  return {
    name:
      firstString(
        stored.name,
        stored.full_name,
        stored.fullName,
        stored.username,
        tokenClaims.name,
        tokenClaims.full_name,
        tokenClaims.fullName
      ) || "",
    email:
      firstString(
        stored.email,
        tokenClaims.email,
        subject?.includes("@") ? subject : undefined
      ) || "",
    role: firstString(stored.role, tokenClaims.role) || "Researcher",
  };
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updated = {
      name: profile.name.trim(),
      email: profile.email.trim(),
      role: profile.role,
    };

    localStorage.setItem("clarivue_profile", JSON.stringify(updated));
    window.dispatchEvent(new Event("clarivue-profile-updated"));

    setProfile(updated);
    setSaved(true);
  }

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CV";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D99B7F] focus:ring-2 focus:ring-[#D99B7F]/15 dark:border-white/10 dark:bg-[#091417] dark:text-[#F3F4F4] dark:placeholder:text-slate-600";

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-9 text-slate-900 dark:text-[#F3F4F4]">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#D99B7F]/10" />
        <div className="pointer-events-none absolute -right-4 -top-12 h-48 w-48 rounded-full border border-[#D99B7F]/10" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D99B7F] font-serif text-2xl text-[#091417]">
            {initials}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A56F63] dark:text-[#D99B7F]">
              <Sparkles size={13} />
              Your personal workspace
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Settings<span className="text-[#D99B7F]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-[#9AADB8]">
              Shape your workspace, manage your profile, and make Clarivue
              feel like your own.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={saveProfile} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <UserRound size={20} />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Personal information</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
                Update the details displayed on your profile.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-600 dark:text-[#B5C2CA]">
                Full name
              </span>
              <input
                className={inputClass}
                value={profile.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-600 dark:text-[#B5C2CA]">
                Email address
              </span>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className={`${inputClass} pl-10`}
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-medium text-slate-600 dark:text-[#B5C2CA]">
                Workspace role
              </span>
              <select
                className={inputClass}
                value={profile.role}
                onChange={(event) =>
                  updateField("role", event.target.value)
                }
              >
                <option>Researcher</option>
                <option>Student</option>
                <option>Professional</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-white/[0.08]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D99B7F] px-5 py-3 text-sm font-semibold text-[#091417] transition hover:brightness-105"
            >
              <Save size={16} />
              Save changes
            </button>

            {saved && (
              <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Check size={16} />
                Profile saved on this device.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Appearance</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
                Choose the look that feels right to you.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-2xl border p-5 text-left transition ${
                theme === "light"
                  ? "border-[#A56F63] bg-[#D99B7F]/10 ring-1 ring-[#D99B7F]/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <Sun size={21} />
                {theme === "light" && (
                  <Check size={17} className="text-[#A56F63]" />
                )}
              </div>
              <p className="text-sm font-medium">Light mode</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
                Soft, clean, and minimal.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-2xl border p-5 text-left transition ${
                theme === "dark"
                  ? "border-[#D99B7F] bg-[#D99B7F]/10 ring-1 ring-[#D99B7F]/20"
                  : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <Moon size={21} />
                {theme === "dark" && (
                  <Check size={17} className="text-[#D99B7F]" />
                )}
              </div>
              <p className="text-sm font-medium">Midnight Slate</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#91A6B2]">
                Deep teal and warm clay.
              </p>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#0B191D] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D99B7F]/15 text-[#A56F63] dark:text-[#D99B7F]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Account & privacy</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-[#9AADB8]">
                Your Clarivue account and password are managed by the
                existing authentication system. Profile edits on this page
                currently update this browser only; they do not change your
                registered account details on the server.
              </p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
