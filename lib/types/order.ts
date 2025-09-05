import { z } from 'zod';

// Order categories enum
export const OrderCategory = {
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  BOOKS: 'Books',
  HOME_GARDEN: 'Home & Garden',
  SPORTS: 'Sports',
  AUTOMOTIVE: 'Automotive',
  HEALTH_BEAUTY: 'Health & Beauty',
  TOYS_GAMES: 'Toys & Games',
} as const;

export type OrderCategoryType = typeof OrderCategory[keyof typeof OrderCategory];

// Order sources enum
export const OrderSource = {
  ONLINE: 'Online',
  STORE: 'Store',
  PHONE: 'Phone',
  MOBILE_APP: 'Mobile App',
  SOCIAL_MEDIA: 'Social Media',
} as const;

export type OrderSourceType = typeof OrderSource[keyof typeof OrderSource];

// Zod schema for Order validation
export const OrderSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
  customer: z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
  category: z.enum([
    OrderCategory.ELECTRONICS,
    OrderCategory.CLOTHING,
    OrderCategory.BOOKS,
    OrderCategory.HOME_GARDEN,
    OrderCategory.SPORTS,
    OrderCategory.AUTOMOTIVE,
    OrderCategory.HEALTH_BEAUTY,
    OrderCategory.TOYS_GAMES,
  ]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  source: z.enum([
    OrderSource.ONLINE,
    OrderSource.STORE,
    OrderSource.PHONE,
    OrderSource.MOBILE_APP,
    OrderSource.SOCIAL_MEDIA,
  ]),
  geo: z.string().min(1, 'Location is required').max(100, 'Location name too long'),
  amount: z.number().positive('Amount must be positive').optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// TypeScript type inferred from Zod schema
export type Order = z.infer<typeof OrderSchema>;

// Partial schema for updates
export const OrderUpdateSchema = OrderSchema.partial().omit({ id: true });
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>;

// Query parameters schema for filtering
export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['date', 'customer', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().optional(),
  source: z.string().optional(),
  geo: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  search: z.string().optional(),
});

export type OrderQuery = z.infer<typeof OrderQuerySchema>;

// Response types
export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category?: string;
    source?: string;
    geo?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  };
}

// API Error response type
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Success response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
