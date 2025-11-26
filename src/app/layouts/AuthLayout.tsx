import QueryClientProvider from "@/core/providers/query-provider";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

const AuthLayout = () => {
  return (
    <QueryClientProvider>
      <Toaster richColors closeButton />
      <Outlet />
    </QueryClientProvider>
  );
};

export default AuthLayout;
