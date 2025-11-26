import { Button } from "@/components/ui/button";
import api from "@/core/api/axios";
import { useAuthStore } from "@/core/store/authStore";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

const Home = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const loginStore = useAuthStore((s) => s.login); // utk update accessToken
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    try {
      // optional: panggil endpoint backend untuk clear refresh cookie
      await api.post("/auth/logout").catch(() => {});

      logout();
      navigate("/", { replace: true });
    } catch (err) {
      logout();
      navigate("/", { replace: true });
    }
  };

  const handleRefreshToken = async () => {
    try {
      const res = await api.post("/auth/refresh-token"); // harus ada di backend
      const newToken = res.data?.data?.accessToken;

      if (!newToken) {
        toast.error("Refresh token gagal: tidak ada token baru");
        return;
      }

      // update store (user tetap)
      loginStore({ user: user!, accessToken: newToken });

      toast.success("AccessToken refreshed!");
    } catch (err: any) {
      toast.error("Refresh gagal. Silakan login ulang.");
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Home</h1>

      <div className="flex gap-3">
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>

        <Button variant="secondary" onClick={handleRefreshToken}>
          Refresh Token
        </Button>
      </div>
    </div>
  );
};

export default Home;
