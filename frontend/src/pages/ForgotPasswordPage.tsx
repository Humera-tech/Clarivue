
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  Search,
  ShieldCheck,
} from "lucide-react";

const c = {
  bg: "#070D11",
  line: "rgba(255,255,255,0.14)",
  text: "#EDEDEA",
  muted: "#B4BFC2",
  accent: "#D49A7E",
  onAccent: "#1A0F0A",
  error: "#F0968A",
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap');

.gl-display {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.gl-body { font-family: 'Inter', system-ui, sans-serif; }

@keyframes gl-fade {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
@keyframes gl-card {
  from { opacity: 0; transform: translateY(30px) scale(.97); }
  to { opacity: 1; transform: none; }
}
@keyframes gl-ken {
  from { transform: scale(1); }
  to { transform: scale(1.07); }
}
@keyframes gl-orb {
  0%,100% { transform: translate(0,0); }
  50% { transform: translate(30px,-24px); }
}
@keyframes gl-sheen {
  from { transform: translateX(-120%); }
  to { transform: translateX(220%); }
}

.gl-in {
  animation: gl-fade .9s cubic-bezier(.2,.8,.2,1) both;
  animation-delay: var(--d,0s);
}
.gl-card {
  animation: gl-card 1s cubic-bezier(.2,.8,.2,1) both .1s;
}
.gl-ken { animation: gl-ken 30s ease-in-out infinite alternate; }
.gl-orb { animation: gl-orb 11s ease-in-out infinite; }

.gl-field {
  transition: border-color .25s, box-shadow .25s, background .25s;
}
.gl-field:focus-within {
  border-color: ${c.accent}!important;
  background: rgba(255,255,255,0.09)!important;
  box-shadow: 0 0 0 4px ${c.accent}26;
}
.gl-btn {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.gl-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);
  transform: translateX(-120%);
  z-index: -1;
}
.gl-btn:hover::after { animation: gl-sheen .9s ease; }
.gl-focus:focus-visible {
  outline: 2px solid ${c.accent};
  outline-offset: 3px;
}
@media (prefers-reduced-motion:reduce) {
  *,*::before,*::after {
    animation: none!important;
    transition: none!important;
  }
}
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to send reset instructions. Please try again."
        );
      }

      setEmail(cleanEmail);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="gl-body relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-24"
      style={{ background: c.bg, color: c.text }}
    >
      <style>{css}</style>

      {/* Background image */}
      <div
        className="gl-ken absolute inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/images/LandingPageDarkMode.png")',
        }}
      />

      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(4,9,12,0.30) 0%, rgba(4,9,12,0.70) 100%)",
        }}
      />

      {/* Ambient glows */}
      <div
        className="gl-orb pointer-events-none absolute left-[18%] top-[22%] -z-10 h-72 w-72 rounded-full blur-[90px]"
        style={{ background: c.accent, opacity: 0.22 }}
      />

      <div
        className="gl-orb pointer-events-none absolute bottom-[14%] right-[16%] -z-10 h-64 w-64 rounded-full blur-[90px]"
        style={{
          background: "#3E8A94",
          opacity: 0.22,
          animationDelay: "-5s",
        }}
      />

      {/* Back to login */}
      <Link
        to="/login"
        className="gl-focus gl-in absolute left-5 top-6 flex items-center gap-2 text-xs transition-colors hover:text-[#D49A7E] sm:left-10"
        style={{ color: c.muted }}
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      {/* Main card */}
      <section
        className="gl-card relative w-full max-w-[440px] overflow-hidden rounded-[22px] p-7 sm:p-10"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 55%), rgba(8,14,18,0.42)",
          backdropFilter: "blur(26px) saturate(150%)",
          WebkitBackdropFilter: "blur(26px) saturate(150%)",
          border: `1px solid ${c.line}`,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Top highlight */}
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
          }}
        />

        {/* Brand */}
        <div
          className="gl-in flex flex-col items-center text-center"
          style={{ ["--d" as string]: "0.2s" }}
        >
          <Link
            to="/"
            className="gl-focus flex items-center gap-2.5"
            aria-label="Clarivue home"
          >
            <Search
              size={26}
              strokeWidth={1.5}
              style={{ color: c.accent }}
            />
            <span className="gl-display text-[28px] leading-none">
              clarivue
            </span>
          </Link>

          {/* Icon */}
          <div
            className="mt-9 flex h-[66px] w-[66px] items-center justify-center rounded-2xl border"
            style={{
              borderColor: `${c.accent}55`,
              background: `${c.accent}12`,
              boxShadow: `0 0 35px ${c.accent}12`,
            }}
          >
            {submitted ? (
              <CheckCircle2
                size={29}
                strokeWidth={1.5}
                style={{ color: c.accent }}
              />
            ) : (
              <ShieldCheck
                size={29}
                strokeWidth={1.5}
                style={{ color: c.accent }}
              />
            )}
          </div>

          <h1 className="gl-display mt-7 text-[36px] leading-[1.05]">
            {submitted ? "Check your inbox" : "Forgot your password?"}
          </h1>

          <p
            className="mt-3 max-w-[310px] text-sm leading-6"
            style={{ color: c.muted }}
          >
            {submitted
              ? "If an account exists for this email, reset instructions will be sent. Check your inbox and spam folder."
              : "It happens. Enter the email associated with your Clarivue account and we'll help you get back in."}
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 space-y-5"
          >
            <div
              className="gl-in"
              style={{ ["--d" as string]: "0.35s" }}
            >
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-medium"
              >
                Email address
              </label>

              <div
                className="gl-field flex items-center gap-3 rounded-xl border px-4"
                style={{
                  borderColor: error ? c.error : c.line,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <Mail size={17} style={{ color: c.muted }} />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#8a999e]"
                />
              </div>

              {error && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-2 text-xs"
                  style={{ color: c.error }}
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gl-btn gl-focus gl-in flex h-12 w-full items-center justify-center gap-3 rounded-full text-sm font-semibold transition-all hover:gap-4 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: c.accent,
                color: c.onAccent,
                ["--d" as string]: "0.5s",
                boxShadow: `0 10px 30px ${c.accent}40`,
              }}
            >
              {loading ? "Sending instructions..." : "Continue"}
              {!loading && <ArrowRight size={16} />}
            </button>

            <p
              className="text-center text-xs leading-5"
              style={{ color: c.muted }}
            >
              For your security, never share your password or verification
              codes with anyone.
            </p>
          </form>
        ) : (
          <div className="mt-8 space-y-5">
            <div
              className="rounded-xl border px-4 py-4 text-sm leading-6"
              style={{
                borderColor: c.line,
                background: "rgba(255,255,255,0.04)",
                color: c.muted,
              }}
            >
              Recovery email entered:

              <p
                className="mt-1 break-all font-medium"
                style={{ color: c.text }}
              >
                {email}
              </p>

              <p className="mt-3 text-xs">
                If an account exists for this email, reset instructions will
                be sent. If you don't receive an email, check your spam folder
                or try again later.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setError("");
              }}
              className="gl-focus w-full rounded-full border py-3 text-sm font-medium transition-colors hover:border-[#D49A7E]"
              style={{ borderColor: c.line, color: c.text }}
            >
              Try another email
            </button>
          </div>
        )}

        <div
          className="gl-in mt-8 border-t pt-6 text-center text-sm"
          style={{
            borderColor: c.line,
            color: c.muted,
            ["--d" as string]: "0.65s",
          }}
        >
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium underline underline-offset-4 transition-colors hover:text-[#D49A7E]"
            style={{ color: c.text }}
          >
            Sign in
          </Link>
        </div>
      </section>

      <p
        className="absolute bottom-5 left-0 right-0 text-center text-xs"
        style={{ color: c.muted }}
      >
        Every answer needs evidence.
      </p>
    </main>
  );
}
