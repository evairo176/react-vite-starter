import { Outlet } from "react-router-dom";

import QueryClientProvider from "@/core/providers/query-provider";
import { Toaster } from "sonner";

const TestingLayout = () => {
  return (
    <QueryClientProvider>
      <Toaster richColors closeButton />
      <Outlet />
    </QueryClientProvider>
  );
};

export default TestingLayout;
