'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute, useAuth } from '@/lib/contexts/AuthContext';
import { store, useAppDispatch, useAppSelector } from '@/lib/store';
import {
  fetchOrders,
  fetchStats,
  setFilters,
  clearFilters,
  setPage,
  clearError
} from '@/lib/store/slices/dashboardSlice';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { OrdersFilter, FilterValues } from '@/components/dashboard/OrdersFilter';
import { exportOrdersToCSV, exportStatsToCSV } from '@/lib/utils/csvExport';
import { toast } from '@/lib/components/ui/Toast';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Dashboard content component
function DashboardContent() {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const {
    orders,
    stats,
    filters,
    pagination,
    loading,
    error,
  } = useAppSelector((state) => state.dashboard);

  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchOrders({
      page: pagination.page,
      limit: pagination.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...filters
    }));
  }, [dispatch]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterValues) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchOrders({
      page: 1, // Reset to first page when filters change
      limit: pagination.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...newFilters
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchOrders({
      page: 1,
      limit: pagination.limit,
      sortBy: 'date',
      sortOrder: 'desc'
    }));
  };

  // Handle sorting
  const handleSort = (sortKey: string) => {
    const newSortOrder = filters.sortBy === sortKey && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    const newFilters = { ...filters, sortBy: sortKey as any, sortOrder: newSortOrder };

    dispatch(setFilters(newFilters));
    dispatch(fetchOrders({
      page: pagination.page,
      limit: pagination.limit,
      ...newFilters
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    dispatch(fetchOrders({
      page,
      limit: pagination.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...filters
    }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchStats()).unwrap(),
        dispatch(fetchOrders({
          page: pagination.page,
          limit: pagination.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          ...filters
        })).unwrap()
      ]);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle CSV export
  const handleExportOrders = async () => {
    try {
      await exportOrdersToCSV(orders, filters);
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  const handleExportStats = async () => {
    if (!stats) {
      toast.error('No statistics data to export');
      return;
    }

    try {
      await exportStatsToCSV(stats);
      toast.success('Statistics exported successfully');
    } catch (error) {
      toast.error('Failed to export statistics');
    }
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
                <button
                  onClick={() => dispatch(clearError())}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor your sales performance and manage orders
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading.orders || loading.stats}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportOrders}
                  disabled={orders.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Orders
                </button>

                <button
                  onClick={handleExportStats}
                  disabled={!stats}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Stats
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <StatsCards stats={stats} loading={loading.stats} />
          </div>

          {/* Charts */}
          <div className="mb-8">
            <Charts stats={stats} loading={loading.stats} />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <OrdersFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              loading={loading.orders}
            />
          </div>

          {/* Orders Table */}
          <div>
            <OrdersTable
              orders={orders}
              loading={loading.orders}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              pagination={pagination}
              onSort={handleSort}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Dashboard page with providers
function DashboardPage() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ProtectedRoute>
          <DashboardContent />
        </ProtectedRoute>
      </QueryClientProvider>
    </Provider>
  );
}

export default DashboardPage;
