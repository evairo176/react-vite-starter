import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import GuestRoute from "./GuestRoute";
import ErrorPage from "../../components/shared/pages/ErrorPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import NotFound from "@/components/shared/pages/NotFound";
import Login from "@/features/auth/Login";
import AuthLayout from "../layouts/AuthLayout";
import Session from "@/features/Session";
import Category from "@/features/portfolio-management/Category";
import TechStack from "@/features/portfolio-management/TechStack";
import Image from "@/features/portfolio-management/Image";
import Portfolio from "@/features/portfolio-management/Portfolio";
import Home from "@/features/dashboard/Home";
import Me from "@/features/Me";
import HomeLayout from "../layouts/HomeLayout/HomeLayout";
import RootLayout from "../layouts/RootLayout";
// `BlogPost` default export is the `AdminBlogManager`; `Portfolio` (imported
// above) default export is the `AdminPortfolioManager`. Both are reused for the
// new dashboard routes below in addition to their existing routes.
import BlogPost from "@/features/blog-post/BlogPost";
import BlogDetail from "@/features/blog/BlogDetail";
// Public feature views (Project list/detail, public Blog list, Contact).
import ProjectList from "@/features/Me/Projects";
import ProjectDetail from "@/features/Me/Projects/Detail";
import { BlogList } from "@/features/Me/Blogs";
import Contact from "@/features/Me/Contact";
// Admin analytics dashboard view.
import AdminAnalyticsView from "@/features/dashboard/Analytics";
// Admin comment moderation view.
import AdminCommentManager from "@/features/blog-comment/CommentManager";
// Admin achievement manager view.
import AchievementManager from "@/features/achievement/AchievementManager";
// Admin backup & restore view.
import BackupManager from "@/features/dashboard/Backup";
import { useAuthStore } from "@/core/store/authStore";

// 🔥 GLOBAL WRAPPER (renders <AnalyticsTracker /> + <Outlet />)
const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorPage,
  notFoundComponent: NotFound,
});

/* -------------------------------------------------------------------------- */
/*                              Guest route group                             */
/* -------------------------------------------------------------------------- */

// Pathless layout route running the guest guard (redirect authenticated users
// away from auth pages). Mirrors the original <GuestRoute /> wrapper.
const guestRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "guest",
  component: GuestRoute,
});

// AuthLayout pathless route -> /login
const authLayoutRoute = createRoute({
  getParentRoute: () => guestRoute,
  id: "auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: Login,
});

// HomeLayout pathless route -> /, /projects, /blog/$slug
const homeLayoutRoute = createRoute({
  getParentRoute: () => guestRoute,
  id: "home",
  component: HomeLayout,
});

const meRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "/",
  component: Me,
});

const projectsRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "/projects",
  component: ProjectList,
});

const projectDetailRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "/projects/$slug",
  component: ProjectDetail,
});

const blogsRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "/blogs",
  component: BlogList,
});

const blogDetailRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  // TanStack uses $param syntax (was :slug under the previous router)
  path: "/blog/$slug",
  component: BlogDetail,
});

const contactRoute = createRoute({
  getParentRoute: () => homeLayoutRoute,
  path: "/contact",
  component: Contact,
});

/* -------------------------------------------------------------------------- */
/*                            Protected route group                           */
/* -------------------------------------------------------------------------- */

// Pathless layout route guarding the dashboard. `beforeLoad` redirects
// unauthenticated users to /login once the auth store has hydrated; while the
// store is not yet hydrated the <ProtectedRoute /> component renders a Loading
// state (preserving the original UX) instead of redirecting prematurely.
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: () => {
    const { isAuthenticated, user, hydrated } = useAuthStore.getState();
    if (hydrated && (!isAuthenticated || !user)) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <ProtectedRoute allowed={[]} />,
});

const dashboardLayoutRoute = createRoute({
  getParentRoute: () => protectedRoute,
  id: "dashboard",
  component: DashboardLayout,
});

const dashboardHomeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard",
  component: Home,
});

const sessionRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/session",
  component: Session,
});

const categoryRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/portfolio-management/category",
  component: Category,
});

const techStackRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/portfolio-management/tech-stack",
  component: TechStack,
});

const imageRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/portfolio-management/image",
  component: Image,
});

const portfolioRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/portfolio-management/portfolio",
  component: Portfolio,
});

const blogPostsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/blog-posts",
  component: BlogPost,
});

const dashboardBlogRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/blog",
  component: BlogPost, // AdminBlogManager
});

const dashboardPortfolioRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/portfolio",
  component: Portfolio, // AdminPortfolioManager
});

const dashboardAnalyticsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/analytics",
  component: AdminAnalyticsView,
});

const dashboardCommentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/comments",
  component: AdminCommentManager,
});

const dashboardAchievementsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/achievements",
  component: AchievementManager,
});

const dashboardBackupRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard/backup",
  component: BackupManager,
});

/* -------------------------------------------------------------------------- */
/*                               Route tree                                   */
/* -------------------------------------------------------------------------- */

const routeTree = rootRoute.addChildren([
  guestRoute.addChildren([
    authLayoutRoute.addChildren([loginRoute]),
    homeLayoutRoute.addChildren([
      meRoute,
      projectsRoute,
      projectDetailRoute,
      blogsRoute,
      blogDetailRoute,
      contactRoute,
    ]),
  ]),
  protectedRoute.addChildren([
    dashboardLayoutRoute.addChildren([
      dashboardHomeRoute,
      sessionRoute,
      categoryRoute,
      techStackRoute,
      imageRoute,
      portfolioRoute,
      blogPostsRoute,
      dashboardBlogRoute,
      dashboardPortfolioRoute,
      dashboardAnalyticsRoute,
      dashboardCommentsRoute,
      dashboardAchievementsRoute,
      dashboardBackupRoute,
    ]),
  ]),
]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ErrorPage,
});

// Register the router instance for type-safety across the app.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
