'use client';

import React from 'react';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  Globe,
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

// Stats card interface
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  loading?: boolean;
}

// Individual stats card component
export function StatsCard({ title, value, change, icon, color, loading = false }: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
  };

  const classes = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="mt-4 h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border ${classes.border} p-6 hover:shadow-lg transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`h-4 w-4 mr-1 ${change.type === 'increase'
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-red-500 dark:text-red-400 rotate-180'
                  }`}
              />
              <span
                className={`text-sm font-medium ${change.type === 'increase'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                  }`}
              >
                {change.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${classes.bg}`}>
          <div className={`h-6 w-6 ${classes.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stats cards container interface
interface StatsCardsProps {
  stats: {
    total: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byLocation: Record<string, number>;
  } | null;
  loading?: boolean;
}

// Main stats cards component
export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get top category
  const getTopCategory = () => {
    if (!stats?.byCategory) return 'N/A';
    const entries = Object.entries(stats.byCategory);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  // Get top source
  const getTopSource = () => {
    if (!stats?.bySource) return 'N/A';
    const entries = Object.entries(stats.bySource);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  // Get top location
  const getTopLocation = () => {
    if (!stats?.byLocation) return 'N/A';
    const entries = Object.entries(stats.byLocation);
    if (entries.length === 0) return 'N/A';
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const statsData = [
    {
      title: 'Total Orders',
      value: stats?.total || 0,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalAmount) : '$0',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green' as const,
    },
    {
      title: 'Average Order Value',
      value: stats ? formatCurrency(stats.averageAmount) : '$0',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const,
    },
    {
      title: 'Top Category',
      value: getTopCategory(),
      icon: <Package className="h-6 w-6" />,
      color: 'orange' as const,
    },
    {
      title: 'Top Source',
      value: getTopSource(),
      icon: <Smartphone className="h-6 w-6" />,
      color: 'indigo' as const,
    },
    {
      title: 'Top Location',
      value: getTopLocation(),
      icon: <Globe className="h-6 w-6" />,
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statsData.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default StatsCards;
