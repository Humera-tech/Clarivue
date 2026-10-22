
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to reset your password.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070D11] px-5 py-12 text-[#F3F4F4]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/LandingPageDarkMode.png')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#070D11]/70"
      />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#111A20]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
        <Link
          to="/login"
          className="text-sm text-[#D49A7E] transition hover:text-[#F3F4F4]"
        >
          ← Back to login
        </Link>

        <div className="mb-8 mt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#D49A7E]">
            CLARIVUE
          </p>

          <h1 className="font-serif text-4xl">
            {success ? "You're all set." : "Create a new password."}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#F3F4F4]/65">
            {success
              ? "Your password has been updated. You can now sign in with your new credentials."
              : "Choose a strong password to secure your account and continue your research."}
          </p>
        </div>

        {success ? (
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full rounded-xl bg-[#D49A7E] px-5 py-3.5 font-medium text-[#111315] transition hover:bg-[#e2b099]"
          >
            Continue to login
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-[#F3F4F4]/80"
              >
                New password
              </label>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-[#070D11]/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/30 focus:border-[#D49A7E]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm text-[#F3F4F4]/80"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-white/10 bg-[#070D11]/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/30 focus:border-[#D49A7E]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#F3F4F4]/65">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="accent-[#D49A7E]"
              />
              Show passwords
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-xl bg-[#D49A7E] px-5 py-3.5 font-medium text-[#111315] transition hover:bg-[#e2b099] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-[#F3F4F4]/55">
            Need a new link?{" "}
            <Link
              to="/forgot-password"
              className="text-[#D49A7E] hover:underline"
            >
              Request a reset
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
