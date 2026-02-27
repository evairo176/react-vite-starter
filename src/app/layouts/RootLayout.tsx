// src/router/RootLayout.tsx
import { Outlet } from "react-router-dom";
import { AnalyticsTracker } from "@/components/shared/analytics";

export default function RootLayout() {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
}
