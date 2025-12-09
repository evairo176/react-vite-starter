import { createBrowserRouter } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ErrorPage from "../../shared/pages/ErrorPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFound from "@/shared/pages/NotFound";
import Login from "@/features/auth/Login";
import AuthLayout from "../layouts/AuthLayout";
import Session from "@/features/Session";
import Category from "@/features/portfolio-management/Category";
import Tag from "@/features/portfolio-management/Tag";
import TechStack from "@/features/portfolio-management/TechStack";
import Image from "@/features/portfolio-management/Image";
import Portfolio from "@/features/portfolio-management/Portfolio";
import Home from "@/features/Home";

const router = createBrowserRouter([
  // 🔹 USER BELUM LOGIN

  {
    element: <GuestRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/login", element: <Login /> },
          { path: "*", element: <NotFound /> },
        ],
      },
      // { path: "/forgot-password", element: <ForgotPassword /> },
      // { path: "/reset-password", element: <ResetPassword /> },
    ],
  },

  {
    element: <ProtectedRoute allowed={[]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Home /> },
          { path: "/session", element: <Session /> },
          { path: "/portfolio-management/category", element: <Category /> },
          { path: "/portfolio-management/tag", element: <Tag /> },
          { path: "/portfolio-management/tech-stack", element: <TechStack /> },
          { path: "/portfolio-management/image", element: <Image /> },
          { path: "/portfolio-management/portfolio", element: <Portfolio /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },

  // catch-all
  { path: "*", element: <NotFound /> },
]);

export default router;
