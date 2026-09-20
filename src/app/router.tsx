import { type ReactNode } from "react";
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from "react-router-dom";

import { useApp } from "./AppContext";
import {
  can,
  type Permission,
} from "../features/permissions/permissions";
import { AppLayout } from "../components/layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import HotelPage from "../pages/HotelPage";
import ClientsPage from "../pages/ClientsPage";
import ClientDetailPage from "../pages/ClientDetailPage";
import MessagesPage from "../pages/MessagesPage";
import TasksPage from "../pages/TasksPage";
import InstructionsPage from "../pages/InstructionsPage";
import EventsPage from "../pages/EventsPage";
import SearchPage from "../pages/SearchPage";
import NotificationsPage from "../pages/admin/NotificationsPage";
import ProfilePage from "../pages/admin/ProfilePage";
import MorePage from "../pages/MorePage";
import AdminPage from "../pages/admin/AdminPage";
import HotelSettingsPage from "../pages/admin/HotelSettingsPage";
import UsersPage from "../pages/admin/UsersPage";
import ServicesPage from "../pages/admin/ServicesPage";
import RolesPage from "../pages/admin/RolesPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import  StayByYouLoader  from "../components/StayByYouLoader/StayByYouLoader";

function AuthLoadingScreen() {
  return <StayByYouLoader fullscreen />;
}

function ProtectedRoute() {
  const { authLoading, isAuthenticated } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { authLoading, isAuthenticated } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const state = location.state as
      | { from?: { pathname?: string; search?: string; hash?: string } }
      | null;
    const from = state?.from;
    const destination = from?.pathname
      ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
      : "/";

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}

function PermissionRoute({ permission }: { permission: Permission }) {
  const { user } = useApp();

  if (!can(user.role, permission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "hotel", element: <HotelPage /> },
          { path: "clients", element: <ClientsPage /> },
          { path: "clients/:id", element: <ClientDetailPage /> },
          { path: "messages", element: <MessagesPage /> },
          { path: "tasks", element: <TasksPage /> },
          { path: "instructions", element: <InstructionsPage /> },
          { path: "events", element: <EventsPage /> },
          { path: "search", element: <SearchPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "more", element: <MorePage /> },
          {
            element: <PermissionRoute permission="admin.read" />,
            children: [
              { path: "admin", element: <AdminPage /> },
              { path: "admin/hotel", element: <HotelSettingsPage /> },
              { path: "admin/users", element: <UsersPage /> },
              { path: "admin/services", element: <ServicesPage /> },
              { path: "admin/roles", element: <RolesPage /> },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
