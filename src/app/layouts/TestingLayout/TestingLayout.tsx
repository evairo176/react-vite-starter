import { Outlet } from "@tanstack/react-router";

import QueryClientProvider from "@/core/providers/query-provider";

const TestingLayout = () => {
  return (
    <QueryClientProvider>
      <Outlet />
    </QueryClientProvider>
  );
};

export default TestingLayout;
