/**
 * Unit tests for OrdersTable component and its sub-components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { Order } from '@/lib/types/order';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronUp: () => <div data-testid="chevron-up" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, yyyy') {
      return 'Jan 15, 2024';
    }
    return date.toString();
  }),
}));

describe('OrdersTable Component', () => {
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      category: 'Electronics',
      date: '2024-01-15T10:30:00Z',
      source: 'Online',
      geo: 'New York',
      amount: 299.99,
      status: 'delivered',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      category: 'Clothing',
      date: '2024-01-14T14:20:00Z',
      source: 'Store',
      geo: 'California',
      amount: 89.50,
      status: 'pending',
      createdAt: new Date('2024-01-14T14:20:00Z'),
      updatedAt: new Date('2024-01-14T14:20:00Z'),
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  const defaultProps = {
    orders: mockOrders,
    loading: false,
    sortBy: 'date',
    sortOrder: 'desc' as const,
    pagination: mockPagination,
    onSort: jest.fn(),
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders table with orders data', () => {
      render(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('$299.99')).toBeInTheDocument();
    });

    it('renders all table headers', () => {
      render(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('Order ID')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders status badges with correct styling', () => {
      render(<OrdersTable {...defaultProps} />);

      const deliveredBadge = screen.getByText('Delivered');
      const pendingBadge = screen.getByText('Pending');

      expect(deliveredBadge).toBeInTheDocument();
      expect(pendingBadge).toBeInTheDocument();
      expect(deliveredBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(<OrdersTable {...defaultProps} loading={true} />);

      const loadingContainer = screen.getByTestId('loading-skeleton');
      expect(loadingContainer).toHaveClass('animate-pulse');
      expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no orders', () => {
      render(<OrdersTable {...defaultProps} orders={[]} />);

      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search criteria.')).toBeInTheDocument();
      expect(screen.getByText('📦')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('calls onSort when header is clicked', () => {
      const onSort = jest.fn();
      render(<OrdersTable {...defaultProps} onSort={onSort} />);

      fireEvent.click(screen.getByText('Customer'));
      expect(onSort).toHaveBeenCalledWith('customer');
    });

    it('shows sort indicators for active column', () => {
      render(<OrdersTable {...defaultProps} sortBy="date" sortOrder="asc" />);

      const dateHeader = screen.getByText('Date').closest('th');
      expect(dateHeader?.querySelector('[data-testid="chevron-up"]')).toBeInTheDocument();
    });

    it('shows descending sort indicator', () => {
      render(<OrdersTable {...defaultProps} sortBy="amount" sortOrder="desc" />);

      const amountHeader = screen.getByText('Amount').closest('th');
      expect(amountHeader?.querySelector('[data-testid="chevron-down"]')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const paginationProps = {
      ...defaultProps,
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      },
    };

    it('renders pagination controls', () => {
      render(<OrdersTable {...paginationProps} />);

      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('calls onPageChange when pagination buttons are clicked', () => {
      const onPageChange = jest.fn();
      render(<OrdersTable {...paginationProps} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByText('Previous'));
      expect(onPageChange).toHaveBeenCalledWith(1);

      fireEvent.click(screen.getByText('Next'));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('disables pagination buttons when appropriate', () => {
      const noPrevProps = {
        ...defaultProps,
        pagination: { ...mockPagination, page: 1, hasPrev: false },
      };
      render(<OrdersTable {...noPrevProps} />);

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('does not render pagination when no orders', () => {
      render(<OrdersTable {...defaultProps} orders={[]} />);

      expect(screen.queryByText('Page')).not.toBeInTheDocument();
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders action buttons when handlers are provided', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onView = jest.fn();

      render(
        <OrdersTable
          {...defaultProps}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      );

      expect(screen.getAllByTestId('eye-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2);
    });

    it('calls action handlers when buttons are clicked', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onView = jest.fn();

      render(
        <OrdersTable
          {...defaultProps}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      );

      const viewButtons = screen.getAllByTestId('eye-icon');
      const editButtons = screen.getAllByTestId('edit-icon');
      const deleteButtons = screen.getAllByTestId('trash-icon');

      fireEvent.click(viewButtons[0].closest('button')!);
      expect(onView).toHaveBeenCalledWith(mockOrders[0]);

      fireEvent.click(editButtons[0].closest('button')!);
      expect(onEdit).toHaveBeenCalledWith(mockOrders[0]);

      fireEvent.click(deleteButtons[0].closest('button')!);
      expect(onDelete).toHaveBeenCalledWith(mockOrders[0]);
    });

    it('does not render action buttons when handlers are not provided', () => {
      render(<OrdersTable {...defaultProps} />);

      expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('formats currency correctly', () => {
      render(<OrdersTable {...defaultProps} />);

      expect(screen.getByText('$299.99')).toBeInTheDocument();
      expect(screen.getByText('$89.50')).toBeInTheDocument();
    });

    it('handles missing amount gracefully', () => {
      const ordersWithoutAmount = [
        { ...mockOrders[0], amount: undefined },
      ];

      render(<OrdersTable {...defaultProps} orders={ordersWithoutAmount} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
      render(<OrdersTable {...defaultProps} />);

      // Since we mocked date-fns format function
      expect(screen.getAllByText('Jan 15, 2024')).toHaveLength(2);
    });

    it('handles invalid dates gracefully', () => {
      const ordersWithInvalidDate = [
        { ...mockOrders[0], date: 'invalid-date' },
      ];

      render(<OrdersTable {...defaultProps} orders={ordersWithInvalidDate} />);

      // Since our mock returns 'Jan 15, 2024' for any date, we expect that
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    });
  });

  describe('Status Badge Component', () => {
    const statusTests = [
      { status: 'pending', expectedClass: 'bg-yellow-100 text-yellow-800' },
      { status: 'processing', expectedClass: 'bg-blue-100 text-blue-800' },
      { status: 'shipped', expectedClass: 'bg-purple-100 text-purple-800' },
      { status: 'delivered', expectedClass: 'bg-green-100 text-green-800' },
      { status: 'cancelled', expectedClass: 'bg-red-100 text-red-800' },
    ];

    statusTests.forEach(({ status, expectedClass }) => {
      it(`renders ${status} status with correct styling`, () => {
        const orderWithStatus = [{ ...mockOrders[0], status }];
        render(<OrdersTable {...defaultProps} orders={orderWithStatus} />);

        const statusBadge = screen.getByText(status.charAt(0).toUpperCase() + status.slice(1));
        expect(statusBadge).toHaveClass(expectedClass);
      });
    });

    it('handles unknown status with default styling', () => {
      const orderWithUnknownStatus = [{ ...mockOrders[0], status: 'unknown' as any }];
      render(<OrdersTable {...defaultProps} orders={orderWithUnknownStatus} />);

      const statusBadge = screen.getByText('Unknown');
      expect(statusBadge).toHaveClass('bg-yellow-100 text-yellow-800');
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      render(<OrdersTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(9);
      expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    });

    it('has proper button titles for actions', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onView = jest.fn();

      render(
        <OrdersTable
          {...defaultProps}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      );

      expect(screen.getAllByTitle('View order')).toHaveLength(2);
      expect(screen.getAllByTitle('Edit order')).toHaveLength(2);
      expect(screen.getAllByTitle('Delete order')).toHaveLength(2);
    });
  });
});
