// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_BY: "date",
  DEFAULT_SORT_ORDER: "desc",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  ORDER_NOT_FOUND: "Order not found",
  INVALID_ORDER_ID: "Invalid order ID",
  INVALID_DATE_RANGE: "Invalid date range",
  INTERNAL_ERROR: "Internal server error",
  METHOD_NOT_ALLOWED: "Method not allowed",
  INVALID_QUERY_PARAMS: "Invalid query parameters",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: "Order created successfully",
  ORDER_UPDATED: "Order updated successfully",
  ORDER_DELETED: "Order deleted successfully",
  ORDERS_RETRIEVED: "Orders retrieved successfully",
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO_DATE: "YYYY-MM-DD",
  ISO_DATETIME: "YYYY-MM-DDTHH:mm:ss.sssZ",
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  ORDERS_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  STATS_TTL: 10 * 60 * 1000, // 10 minutes in milliseconds
} as const;
