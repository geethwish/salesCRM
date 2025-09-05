'use client';

import { ProtectedRoute } from '@/lib/contexts/AuthContext';
import { useAuth } from '@/lib/contexts/AuthContext';

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sales CRM Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {user?.name}!
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Welcome to your Sales CRM dashboard!
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  User Information
                </h3>
                <div className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong className="text-gray-900 dark:text-white">Name:</strong> {user?.name}</p>
                  <p><strong className="text-gray-900 dark:text-white">Email:</strong> {user?.email}</p>
                  <p><strong className="text-gray-900 dark:text-white">Role:</strong> {user?.role}</p>
                  <p><strong className="text-gray-900 dark:text-white">Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
                  <p><strong className="text-gray-900 dark:text-white">Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
