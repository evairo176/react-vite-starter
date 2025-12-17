import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import router from "./app/routes/index.tsx";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./core/providers/theme-provider.tsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
