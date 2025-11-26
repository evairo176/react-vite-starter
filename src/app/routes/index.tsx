import { createBrowserRouter } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ErrorPage from "../../shared/pages/ErrorPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFound from "@/shared/pages/NotFound";
import Login from "@/features/auth/Login";
import AuthLayout from "../layouts/AuthLayout";
import Home from "@/features/dashboard/Home";
import Session from "@/features/Session";

const router = createBrowserRouter([
  // 🔹 USER BELUM LOGIN

  {
    element: <GuestRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/", element: <Login /> },
          { path: "*", element: <NotFound /> },
        ],
      },
      // { path: "/forgot-password", element: <ForgotPassword /> },
      // { path: "/reset-password", element: <ResetPassword /> },
    ],
  },

  {
    element: <ProtectedRoute allowed={[1]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Home /> },
          { path: "/session", element: <Session /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },

  // catch-all
  { path: "*", element: <NotFound /> },
]);

export default router;
