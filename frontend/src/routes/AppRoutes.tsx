
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

import { ThemeProvider } from "../context/ThemeContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import DashboardPage from "../pages/DashboardPage";
import DocumentsPage from "../pages/DocumentsPage";
import AnalysisPage from "../pages/AnalysisPage";
import SettingsPage from "../pages/SettingsPage";
import EvidencePage from "../pages/EvidencePage";
import HistoryPage from "../pages/HistoryPage";

function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <section className="py-10">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A56F63] dark:text-[#D99B7F]">
        CLARIVUE WORKSPACE
      </p>

      <h1 className="font-serif text-4xl">{title}</h1>

      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
        This section is coming soon. We'll build it into your Clarivue
        research workspace next.
      </p>
    </section>
  );
}

export default function AppRoutes() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard overview */}
            <Route index element={<DashboardPage />} />

            {/* Document library */}
            <Route
              path="documents"
              element={<DocumentsPage />}
            />

            {/* Ask Clarivue / document analysis */}
            <Route
              path="ask"
              element={<AnalysisPage />}
            />

            {/* Evidence library */}
            <Route path="evidence" element={<EvidencePage />} />

            {/* Research history */}
            <Route path="history" element={<HistoryPage />} />

            {/* Profile and preferences */}
            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>

          {/* Redirect unknown URLs */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
