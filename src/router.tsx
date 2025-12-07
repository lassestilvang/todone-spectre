import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider";
import { KeyboardProvider } from "./features/keyboard/KeyboardProvider";
import { KeyboardShortcuts } from "./features/keyboard/KeyboardShortcuts";
import { KeyboardHelp } from "./features/keyboard/KeyboardHelp";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AuthLayout from "./features/auth/AuthLayout";
import TasksPage from "./pages/tasks/TasksPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import TaskCreatePage from "./pages/tasks/TaskCreatePage";
import RecurringTasksPage from "./pages/tasks/RecurringTasksPage";
import InboxPage from "./pages/InboxPage";
import TodayPage from "./pages/TodayPage";
import UpcomingPage from "./pages/UpcomingPage";
import FiltersPage from "./pages/FiltersPage";
import LabelsPage from "./pages/LabelsPage";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // DISABLED FOR TESTING: Skip authentication checks
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       Loading...
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/auth/login" replace />;
  // }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  // DISABLED FOR TESTING: Skip authentication checks
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       Loading...
  //     </div>
  //   );
  // }

  // if (isAuthenticated) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <KeyboardProvider>
          <KeyboardShortcuts>
            <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
              <header
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "1rem",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  Todone
                </h1>
              </header>

              <main
                style={{
                  maxWidth: "1200px",
                  margin: "0 auto",
                  padding: "1rem",
                }}
              >
                <Outlet />
              </main>

              <footer
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  color: "#6b7280",
                }}
              >
                <p>© {new Date().getFullYear()} Todone. All rights reserved.</p>
              </footer>
            </div>
            <KeyboardHelp />
          </KeyboardShortcuts>
        </KeyboardProvider>
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/tasks",
        element: (
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/tasks/create",
        element: (
          <ProtectedRoute>
            <TaskCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/tasks/recurring",
        element: (
          <ProtectedRoute>
            <RecurringTasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/tasks/:taskId",
        element: (
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inbox",
        element: (
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/today",
        element: (
          <ProtectedRoute>
            <TodayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/upcoming",
        element: (
          <ProtectedRoute>
            <UpcomingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/filters",
        element: (
          <ProtectedRoute>
            <FiltersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/labels",
        element: (
          <ProtectedRoute>
            <LabelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/auth",
        element: (
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        ),
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
          },
        ],
      },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export { Router };
export default Router;
