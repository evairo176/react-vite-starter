import {
  QueryClient,
  QueryClientProvider as QueryClientProvider_,
} from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      //   staleTime: 60 * 60 * 1000, // 60 menit
    },
  },
});

const QueryClientProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider_ client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider_>
  );
};

export default QueryClientProvider;
