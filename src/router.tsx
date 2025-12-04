import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AuthLayout from './features/auth/AuthLayout';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import TaskCreatePage from './pages/tasks/TaskCreatePage';
import RecurringTasksPage from './pages/tasks/RecurringTasksPage';
import InboxPage from './pages/InboxPage';
import TodayPage from './pages/TodayPage';
import UpcomingPage from './pages/UpcomingPage';
import FiltersPage from './pages/FiltersPage';
import LabelsPage from './pages/LabelsPage';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/tasks',
        element: (
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/tasks/create',
        element: (
          <ProtectedRoute>
            <TaskCreatePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/tasks/recurring',
        element: (
          <ProtectedRoute>
            <RecurringTasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/tasks/:taskId',
        element: (
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inbox',
        element: (
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/today',
        element: (
          <ProtectedRoute>
            <TodayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/upcoming',
        element: (
          <ProtectedRoute>
            <UpcomingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/filters',
        element: (
          <ProtectedRoute>
            <FiltersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/labels',
        element: (
          <ProtectedRoute>
            <LabelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/auth',
        element: <PublicRoute><AuthLayout /></PublicRoute>,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
          },
        ],
      },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};