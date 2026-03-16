// src/router/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/core/store/authStore";

interface ProtectedRouteProps {
  allowed?: string[]; // id role yang diizinkan, misal [1,2]
}

export default function ProtectedRoute({ allowed }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, hydrated } = useAuthStore();

  // ⏳ 1) BELUM REHYDRATED → jangan redirect dulu
  if (!hydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔑 2) Setelah hydrated: baru evaluasi auth
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // 3) Optional role check
  if (allowed && !allowed.includes(user?.role as string)) {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
}
