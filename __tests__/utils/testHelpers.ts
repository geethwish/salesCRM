/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { Order, OrderCategory, OrderSource } from "../../lib/types/order";
import { generateToken } from "../../lib/utils/auth";
import { PublicUser } from "../../lib/types/auth";

/**
 * Mock user for testing
 */
export const mockTestUser: PublicUser = {
  id: "test-user-id-123",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  isActive: true,
  emailVerified: true,
  createdAt: new Date("2025-09-01T10:00:00.000Z"),
  updatedAt: new Date("2025-09-01T10:00:00.000Z"),
};

/**
 * Mock admin user for testing
 */
export const mockAdminUser: PublicUser = {
  id: "admin-user-id-123",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  isActive: true,
  emailVerified: true,
  createdAt: new Date("2025-09-01T10:00:00.000Z"),
  updatedAt: new Date("2025-09-01T10:00:00.000Z"),
};

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  method: string = "GET",
  url: string = "http://localhost:3001/api/orders",
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create a mock authenticated NextRequest for testing
 */
export function createAuthenticatedRequest(
  method: string = "GET",
  url: string = "http://localhost:3001/api/orders",
  body?: any,
  user: PublicUser = mockTestUser,
  headers?: Record<string, string>
): NextRequest {
  const token = generateToken(user);

  return createMockRequest(method, url, body, {
    Authorization: `Bearer ${token}`,
    ...headers,
  });
}

/**
 * Create a mock authenticated NextRequest with cookie auth for testing
 */
export function createCookieAuthenticatedRequest(
  method: string = "GET",
  url: string = "http://localhost:3001/api/orders",
  body?: any,
  user: PublicUser = mockTestUser,
  headers?: Record<string, string>
): NextRequest {
  const token = generateToken(user);

  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth-token=${token}`,
      ...headers,
    },
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create mock order data for testing
 */
export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "test-order-id-123",
    customer: "Test Customer",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "Test Location",
    amount: 100.0,
    status: "pending",
    createdAt: new Date("2025-09-01T10:00:00.000Z"),
    updatedAt: new Date("2025-09-01T10:00:00.000Z"),
    ...overrides,
  };
}

/**
 * Create mock order input data for testing
 */
export function createMockOrderInput(overrides: any = {}) {
  return {
    customer: "Test Customer",
    category: OrderCategory.ELECTRONICS,
    date: "2025-09-01",
    source: OrderSource.ONLINE,
    geo: "Test Location",
    amount: 100.0,
    status: "pending",
    ...overrides,
  };
}

/**
 * Create multiple mock orders for testing
 */
export function createMockOrders(count: number = 5): Order[] {
  const orders: Order[] = [];
  const categories = Object.values(OrderCategory);
  const sources = Object.values(OrderSource);
  const locations = ["New York", "California", "Texas", "Florida", "Illinois"];
  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ] as const;

  for (let i = 0; i < count; i++) {
    orders.push(
      createMockOrder({
        id: `test-order-${i + 1}`,
        customer: `Customer ${i + 1}`,
        category: categories[i % categories.length],
        source: sources[i % sources.length],
        geo: locations[i % locations.length],
        amount: (i + 1) * 100,
        status: statuses[i % statuses.length],
        date: `2025-09-${String(i + 1).padStart(2, "0")}`,
      })
    );
  }

  return orders;
}

/**
 * Extract JSON from Response object
 */
export async function getResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse response as JSON: ${text}`);
  }
}

/**
 * Assert that response has expected structure
 */
export function assertApiResponse(
  response: any,
  expectedSuccess: boolean,
  expectedStatus?: number
): void {
  expect(response).toHaveProperty("success", expectedSuccess);

  if (expectedSuccess) {
    expect(response).toHaveProperty("data");
    expect(response).not.toHaveProperty("error");
  } else {
    expect(response).toHaveProperty("error");
    expect(response).not.toHaveProperty("data");

    if (expectedStatus) {
      expect(response.error).toHaveProperty("statusCode", expectedStatus);
    }
  }
}

/**
 * Assert that order has expected structure
 */
export function assertOrderStructure(order: any): void {
  expect(order).toHaveProperty("id");
  expect(order).toHaveProperty("customer");
  expect(order).toHaveProperty("category");
  expect(order).toHaveProperty("date");
  expect(order).toHaveProperty("source");
  expect(order).toHaveProperty("geo");
  expect(order).toHaveProperty("status");
  expect(order).toHaveProperty("createdAt");
  expect(order).toHaveProperty("updatedAt");

  // Validate types
  expect(typeof order.id).toBe("string");
  expect(typeof order.customer).toBe("string");
  expect(typeof order.category).toBe("string");
  expect(typeof order.date).toBe("string");
  expect(typeof order.source).toBe("string");
  expect(typeof order.geo).toBe("string");
  expect(typeof order.status).toBe("string");

  // Validate date format
  expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  // Validate enums
  expect(Object.values(OrderCategory)).toContain(order.category);
  expect(Object.values(OrderSource)).toContain(order.source);
  expect([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]).toContain(order.status);
}

/**
 * Assert that order list response has expected structure
 */
export function assertOrderListResponse(response: any): void {
  expect(response).toHaveProperty("orders");
  expect(response).toHaveProperty("pagination");
  expect(response).toHaveProperty("filters");

  expect(Array.isArray(response.orders)).toBe(true);

  // Check pagination structure
  expect(response.pagination).toHaveProperty("page");
  expect(response.pagination).toHaveProperty("limit");
  expect(response.pagination).toHaveProperty("total");
  expect(response.pagination).toHaveProperty("totalPages");
  expect(response.pagination).toHaveProperty("hasNext");
  expect(response.pagination).toHaveProperty("hasPrev");

  // Validate pagination types
  expect(typeof response.pagination.page).toBe("number");
  expect(typeof response.pagination.limit).toBe("number");
  expect(typeof response.pagination.total).toBe("number");
  expect(typeof response.pagination.totalPages).toBe("number");
  expect(typeof response.pagination.hasNext).toBe("boolean");
  expect(typeof response.pagination.hasPrev).toBe("boolean");

  // Check each order structure
  response.orders.forEach((order: any) => {
    assertOrderStructure(order);
  });
}

/**
 * Assert that stats response has expected structure
 */
export function assertStatsResponse(stats: any): void {
  expect(stats).toHaveProperty("total");
  expect(stats).toHaveProperty("byCategory");
  expect(stats).toHaveProperty("bySource");
  expect(stats).toHaveProperty("byLocation");
  expect(stats).toHaveProperty("totalAmount");
  expect(stats).toHaveProperty("averageAmount");

  expect(typeof stats.total).toBe("number");
  expect(typeof stats.byCategory).toBe("object");
  expect(typeof stats.bySource).toBe("object");
  expect(typeof stats.byLocation).toBe("object");
  expect(typeof stats.totalAmount).toBe("number");
  expect(typeof stats.averageAmount).toBe("number");
}

/**
 * Sleep utility for async tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
export function generateRandomString(length: number = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomNumber(
  min: number = 1,
  max: number = 1000
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomDate(): string {
  const year = 2025;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}
