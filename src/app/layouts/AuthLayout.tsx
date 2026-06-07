import QueryClientProvider from "@/core/providers/query-provider";
import { Outlet } from "@tanstack/react-router";

const AuthLayout = () => {
  return (
    <QueryClientProvider>
      <Outlet />
    </QueryClientProvider>
  );
};

export default AuthLayout;
