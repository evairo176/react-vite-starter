// src/app/routes/GuestRoute.tsx

import { useAuthStore } from "@/core/store/authStore";
import { Navigate, Outlet, useLocation } from "@tanstack/react-router";

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
  const isAuthRoute = AUTH_PATHS.includes(location.pathname);

  if (isAuthenticated && isAuthRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // Kalau user sudah login tapi bukan mengakses halaman auth, jangan redirect.
  // Mengembalikan <Outlet /> agar router tetap bisa mencari route yang cocok.
  return <Outlet />;
}
