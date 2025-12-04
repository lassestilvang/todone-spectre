import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-primary-600">Dashboard</h2>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Welcome, {user?.name || user?.email}!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You are successfully authenticated. This is your dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Tasks</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">0</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200">Completed</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">0</p>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Pending</h4>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;