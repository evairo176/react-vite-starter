// src/app/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/core/store/authStore";

interface ProtectedRouteProps {
  allowed?: string[]; // id role yang diizinkan, misal [1,2]
}

export default function ProtectedRoute({ allowed: _allowed }: ProtectedRouteProps) {
  const { isAuthenticated, user, hydrated } = useAuthStore();

  // ⏳ 1) BELUM REHYDRATED → jangan redirect dulu
  if (!hydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔑 2) Setelah hydrated: baru evaluasi auth → redirect ke login (Req 18.5)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
