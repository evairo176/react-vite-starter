// src/router/GuestRoute.tsx
import { AnalyticsTracker } from "@/components/shared/analytics";
import { useAuthStore } from "@/core/store/authStore";
import { Navigate, Outlet, useLocation, matchPath } from "react-router-dom";

const AUTH_PATHS = ["/", "/login", "/forgot-password", "/reset-password"];

export default function GuestRoute() {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Hanya redirect ke /dashboard bila user sudah login *dan*
  // sedang mengakses salah satu halaman auth (mis. '/', '/login')
  const isAuthRoute = AUTH_PATHS.some((p) =>
    Boolean(matchPath({ path: p, end: true }, location.pathname)),
  );

  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // Kalau user sudah login tapi bukan mengakses halaman auth, jangan redirect.
  // Mengembalikan <Outlet /> agar router tetap bisa mencari route yang cocok
  // (mis. ProtectedRoute / NotFound).
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
}
