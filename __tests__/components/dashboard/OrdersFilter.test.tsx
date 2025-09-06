/**
 * Unit tests for OrdersFilter component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OrdersFilter } from '@/components/dashboard/OrdersFilter';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('OrdersFilter', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    onClearFilters: mockOnClearFilters,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and filters button', () => {
    render(<OrdersFilter {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search by customer, category, source, or location...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('handles search input changes with debouncing', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by customer, category, source, or location...');
    await user.type(searchInput, 'test search');

    // Should not call immediately
    expect(mockOnFiltersChange).not.toHaveBeenCalled();

    // Should call after debounce delay
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'test search' });
    }, { timeout: 500 });
  });

  it('expands and collapses advanced filters', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    const filtersButton = screen.getByRole('button', { name: /filters/i });

    // Initially collapsed
    expect(screen.queryByLabelText(/category/i)).not.toBeInTheDocument();

    // Expand filters
    await user.click(filtersButton);
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
  });

  it('handles category filter changes', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    // Expand filters
    await user.click(screen.getByRole('button', { name: /filters/i }));

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'Electronics');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: 'Electronics' });
  });

  it('handles source filter changes', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    // Expand filters
    await user.click(screen.getByRole('button', { name: /filters/i }));

    const sourceSelect = screen.getByLabelText(/source/i);
    await user.selectOptions(sourceSelect, 'Online');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ source: 'Online' });
  });

  it('handles location filter changes', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    // Expand filters
    await user.click(screen.getByRole('button', { name: /filters/i }));

    const locationSelect = screen.getByLabelText(/location/i);
    await user.selectOptions(locationSelect, 'New York');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ geo: 'New York' });
  });

  it('handles date range filter changes', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    // Expand filters
    await user.click(screen.getByRole('button', { name: /filters/i }));

    const dateFromInput = screen.getByLabelText(/date from/i);
    const dateToInput = screen.getByLabelText(/date to/i);

    await user.type(dateFromInput, '2025-01-01');
    await user.type(dateToInput, '2025-12-31');

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ dateFrom: '2025-01-01' });
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
  });

  it('shows clear button when filters are active', () => {
    const filtersWithValues = {
      category: 'Electronics',
      search: 'test',
    };

    render(<OrdersFilter {...defaultProps} filters={filtersWithValues} />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('hides clear button when no filters are active', () => {
    render(<OrdersFilter {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues = {
      category: 'Electronics',
      search: 'test',
    };

    render(<OrdersFilter {...defaultProps} filters={filtersWithValues} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('shows active filter count badge', () => {
    const filtersWithValues = {
      category: 'Electronics',
      source: 'Online',
      search: 'test',
    };

    render(<OrdersFilter {...defaultProps} filters={filtersWithValues} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // Badge showing 3 active filters
  });

  it('disables inputs when loading', () => {
    render(<OrdersFilter {...defaultProps} loading={true} />);

    expect(screen.getByPlaceholderText('Search by customer, category, source, or location...')).toBeDisabled();
    expect(screen.getByRole('button', { name: /filters/i })).toBeDisabled();
  });

  it('updates local filters when props change', () => {
    const { rerender } = render(<OrdersFilter {...defaultProps} />);

    const newFilters = { category: 'Electronics' };
    rerender(<OrdersFilter {...defaultProps} filters={newFilters} />);

    // Expand filters to see the value
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('Electronics');
  });

  it('handles empty string values correctly', async () => {
    const user = userEvent.setup();
    render(<OrdersFilter {...defaultProps} />);

    // Expand filters
    await user.click(screen.getByRole('button', { name: /filters/i }));

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, ''); // Select "All Categories"

    expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: undefined });
  });
});
