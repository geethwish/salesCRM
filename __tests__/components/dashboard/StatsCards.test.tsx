/**
 * Unit tests for StatsCards component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsCards } from '@/components/dashboard/StatsCards';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}));

describe('StatsCards', () => {
  const mockStats = {
    total: 150,
    totalAmount: 75000,
    averageAmount: 500,
    byCategory: {
      'Electronics': 50,
      'Clothing': 30,
      'Books': 25,
      'Home & Garden': 20,
      'Sports': 15,
      'Automotive': 10,
    },
    bySource: {
      'Online': 80,
      'Store': 40,
      'Phone': 20,
      'Mobile App': 10,
    },
    byLocation: {
      'New York': 30,
      'California': 25,
      'Texas': 20,
      'Florida': 15,
      'Illinois': 10,
    },
  };

  it('renders all stat cards with correct data', () => {
    render(<StatsCards stats={mockStats} />);

    // Check if all cards are rendered
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Average Order Value')).toBeInTheDocument();
    expect(screen.getByText('Top Category')).toBeInTheDocument();
    expect(screen.getByText('Top Source')).toBeInTheDocument();
    expect(screen.getByText('Top Location')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('$75,000')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<StatsCards stats={null} loading={true} />);

    // Check for loading skeletons
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.length).toBeGreaterThan(0);

    // Should not show actual data during loading
    expect(screen.queryByText('Total Orders')).not.toBeInTheDocument();
  });

  it('handles null stats gracefully', () => {
    render(<StatsCards stats={null} />);

    // Should still render cards with default values
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('$0')).toHaveLength(2); // Total Revenue and Average Order Value
    expect(screen.getAllByText('N/A')).toHaveLength(3); // Top Category, Source, and Location
  });

  it('handles empty stats gracefully', () => {
    const emptyStats = {
      total: 0,
      totalAmount: 0,
      averageAmount: 0,
      byCategory: {},
      bySource: {},
      byLocation: {},
    };

    render(<StatsCards stats={emptyStats} />);

    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('$0')).toHaveLength(2); // Total Revenue and Average Order Value
    expect(screen.getAllByText('N/A')).toHaveLength(3); // Top Category, Source, and Location
  });

  it('formats currency correctly', () => {
    const statsWithDecimals = {
      ...mockStats,
      totalAmount: 1234.56,
      averageAmount: 123.45,
    };

    render(<StatsCards stats={statsWithDecimals} />);

    expect(screen.getByText('$1,235')).toBeInTheDocument(); // Rounded
    expect(screen.getByText('$123')).toBeInTheDocument(); // Rounded
  });

  it('formats large numbers correctly', () => {
    const statsWithLargeNumbers = {
      ...mockStats,
      total: 1000000,
      totalAmount: 5000000,
      averageAmount: 5000,
    };

    render(<StatsCards stats={statsWithLargeNumbers} />);

    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('$5,000,000')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('finds correct top values from data', () => {
    const statsWithDifferentTops = {
      ...mockStats,
      byCategory: {
        'Books': 100,
        'Electronics': 50,
        'Clothing': 30,
      },
      bySource: {
        'Store': 80,
        'Online': 60,
        'Phone': 20,
      },
      byLocation: {
        'Texas': 50,
        'New York': 30,
        'California': 25,
      },
    };

    render(<StatsCards stats={statsWithDifferentTops} />);

    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Store')).toBeInTheDocument();
    expect(screen.getByText('Texas')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<StatsCards stats={mockStats} />);

    // Find the card container (should be the parent div with the styling classes)
    const totalOrdersText = screen.getByText('Total Orders');
    const cardContainer = totalOrdersText.closest('.bg-white');

    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer).toHaveClass('bg-white');
    expect(cardContainer).toHaveClass('rounded-lg');
    expect(cardContainer).toHaveClass('shadow');
  });
});
