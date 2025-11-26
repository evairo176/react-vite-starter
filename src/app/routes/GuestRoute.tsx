import { useAuthStore } from "@/core/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const { isAuthenticated, hydrated } = useAuthStore();

  // ⏳ 1) Store belum rehydrate → jangan redirect dulu!
  if (!hydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 2) Jika sudah login → redirect ke dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 🪪 3) Jika user guest → boleh akses halaman
  return <Outlet />;
}
