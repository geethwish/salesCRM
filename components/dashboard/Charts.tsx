'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

// Chart container component
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

function ChartContainer({ title, children, loading = false, className = '' }: ChartContainerProps) {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-gray-900 dark:text-white font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Color palette for charts
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#8B5CF6', // violet-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#6366F1', // indigo-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
];

// Category chart component
interface CategoryChartProps {
  data: Record<string, number>;
  loading?: boolean;
}

export function CategoryChart({ data, loading = false }: CategoryChartProps) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ChartContainer title="Orders by Category" loading={loading}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Source pie chart component
interface SourceChartProps {
  data: Record<string, number>;
  loading?: boolean;
}

export function SourceChart({ data, loading = false }: SourceChartProps) {
  const chartData = Object.entries(data || {}).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <ChartContainer title="Orders by Source" loading={loading}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Location chart component
interface LocationChartProps {
  data: Record<string, number>;
  loading?: boolean;
}

export function LocationChart({ data, loading = false }: LocationChartProps) {
  const chartData = Object.entries(data || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10) // Show top 10 locations
    .map(([name, value]) => ({
      name,
      value,
    }));

  return (
    <ChartContainer title="Top Locations" loading={loading}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis type="number" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12 }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Combined charts component
interface ChartsProps {
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

export function Charts({ stats, loading = false }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CategoryChart data={stats?.byCategory || {}} loading={loading} />
      <SourceChart data={stats?.bySource || {}} loading={loading} />
      <div className="lg:col-span-2">
        <LocationChart data={stats?.byLocation || {}} loading={loading} />
      </div>
    </div>
  );
}

export default Charts;
