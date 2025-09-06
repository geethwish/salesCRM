/**
 * Test setup utilities and configurations
 */

import { orderService } from "@/lib/services/orderService";
import { sampleOrderData, scenarioTestData } from "../fixtures/orderFixtures";
import { Order, OrderListResponse } from "@/lib/types/order";

/**
 * Database setup utilities
 */
export class TestDatabaseSetup {
  /**
   * Clear all data from the database
   */
  static async clearDatabase(): Promise<void> {
    await orderService.clearAllOrders();
  }

  /**
   * Seed database with sample data
   */
  static async seedSampleData(): Promise<void> {
    await this.clearDatabase();

    for (const orderData of sampleOrderData) {
      await orderService.createOrder(orderData);
    }
  }

  /**
   * Seed database with specific scenario data
   */
  static async seedScenarioData(
    scenario: keyof typeof scenarioTestData
  ): Promise<void> {
    await this.clearDatabase();

    const data = scenarioTestData[scenario];
    for (const orderData of data) {
      await orderService.createOrder(orderData);
    }
  }

  /**
   * Seed database with custom data
   */
  static async seedCustomData(orders: Partial<Order>[]): Promise<void> {
    await this.clearDatabase();

    for (const orderData of orders) {
      await orderService.createOrder(orderData);
    }
  }

  /**
   * Get current database state
   */
  static async getDatabaseState() {
    const count = await orderService.getOrderCount();
    const stats = await orderService.getOrderStats();

    return {
      count,
      stats,
    };
  }
}

/**
 * Test environment configuration
 */
export const testConfig = {
  // API endpoints
  endpoints: {
    orders: "/api/orders",
    orderById: (id: string) => `/api/orders/${id}`,
    orderStats: "/api/orders/stats",
    seed: "/api/seed",
  },

  // Test timeouts
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 10000,
  },

  // Test data limits
  limits: {
    maxPageSize: 100,
    defaultPageSize: 10,
    maxCustomerNameLength: 100,
    maxLocationNameLength: 100,
  },

  // Test URLs
  baseUrl: "http://localhost:3001",
};

/**
 * Test assertion helpers
 */
export class TestAssertions {
  /**
   * Assert that two dates are approximately equal (within tolerance)
   */
  static assertDatesApproximatelyEqual(
    actual: Date | string,
    expected: Date | string,
    toleranceMs: number = 1000
  ): void {
    const actualTime =
      typeof actual === "string"
        ? new Date(actual).getTime()
        : actual.getTime();
    const expectedTime =
      typeof expected === "string"
        ? new Date(expected).getTime()
        : expected.getTime();
    const diff = Math.abs(actualTime - expectedTime);

    if (diff > toleranceMs) {
      throw new Error(
        `Dates are not approximately equal. Difference: ${diff}ms, Tolerance: ${toleranceMs}ms`
      );
    }
  }

  /**
   * Assert that an array is sorted by a specific field
   */
  static assertArraySortedBy<T>(
    array: T[],
    field: keyof T,
    order: "asc" | "desc" = "asc"
  ): void {
    for (let i = 1; i < array.length; i++) {
      const current = array[i][field];
      const previous = array[i - 1][field];

      if (order === "asc") {
        if (current < previous) {
          throw new Error(
            `Array is not sorted in ascending order by ${String(
              field
            )}. Item ${i}: ${current} < ${previous}`
          );
        }
      } else {
        if (current > previous) {
          throw new Error(
            `Array is not sorted in descending order by ${String(
              field
            )}. Item ${i}: ${current} > ${previous}`
          );
        }
      }
    }
  }

  /**
   * Assert that pagination object has correct structure and values
   */
  static assertPaginationValid(
    pagination: OrderListResponse["pagination"],
    expectedPage: number,
    expectedLimit: number,
    expectedTotal: number
  ): void {
    expect(pagination).toHaveProperty("page", expectedPage);
    expect(pagination).toHaveProperty("limit", expectedLimit);
    expect(pagination).toHaveProperty("total", expectedTotal);
    expect(pagination).toHaveProperty(
      "totalPages",
      Math.ceil(expectedTotal / expectedLimit)
    );
    expect(pagination).toHaveProperty(
      "hasNext",
      expectedPage < Math.ceil(expectedTotal / expectedLimit)
    );
    expect(pagination).toHaveProperty("hasPrev", expectedPage > 1);
  }

  /**
   * Assert that statistics object has correct structure
   */
  static assertStatisticsValid(stats: {
    total: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byLocation: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
  }): void {
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

    // Verify totals match
    const categoryTotal = Object.values(stats.byCategory).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    const sourceTotal = Object.values(stats.bySource).reduce(
      (sum: number, count: number) => sum + count,
      0
    );
    const locationTotal = Object.values(stats.byLocation).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    expect(categoryTotal).toBe(stats.total);
    expect(sourceTotal).toBe(stats.total);
    expect(locationTotal).toBe(stats.total);

    if (stats.total > 0) {
      expect(stats.averageAmount).toBe(stats.totalAmount / stats.total);
    } else {
      expect(stats.averageAmount).toBe(0);
    }
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time of a function
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    return { result, duration };
  }

  /**
   * Assert that execution time is within expected range
   */
  static assertExecutionTimeWithin(
    actualMs: number,
    maxMs: number,
    operation: string = "Operation"
  ): void {
    if (actualMs > maxMs) {
      throw new Error(
        `${operation} took ${actualMs.toFixed(
          2
        )}ms, expected less than ${maxMs}ms`
      );
    }
  }

  /**
   * Run performance benchmark
   */
  static async runBenchmark<T>(
    fn: () => Promise<T>,
    iterations: number = 10,
    warmupIterations: number = 3
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    iterations: number;
  }> {
    // Warmup
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    // Actual benchmark
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureExecutionTime(fn);
      times.push(duration);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
      iterations,
    };
  }
}

/**
 * Test data generators
 */
export class TestDataGenerators {
  /**
   * Generate random order data
   */
  static generateRandomOrder(overrides: Partial<Order> = {}) {
    const categories = [
      "Electronics",
      "Clothing",
      "Books",
      "Home & Garden",
      "Sports",
    ];
    const sources = ["Online", "Store", "Phone", "Mobile App", "Social Media"];
    const locations = [
      "New York",
      "California",
      "Texas",
      "Florida",
      "Illinois",
    ];
    const statuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    return {
      customer: `Customer ${Math.floor(Math.random() * 1000)}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      date: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(
        2,
        "0"
      )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      geo: locations[Math.floor(Math.random() * locations.length)],
      amount: Math.round((Math.random() * 1000 + 10) * 100) / 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      ...overrides,
    };
  }

  /**
   * Generate batch of random orders
   */
  static generateRandomOrders(count: number, overrides: Partial<Order> = {}) {
    return Array.from({ length: count }, () =>
      this.generateRandomOrder(overrides)
    );
  }
}

/**
 * Global test setup and teardown
 */
export const globalTestSetup = {
  /**
   * Setup before all tests
   */
  async beforeAll(): Promise<void> {
    // Any global setup can go here
    console.log("🧪 Starting test suite...");
  },

  /**
   * Cleanup after all tests
   */
  async afterAll(): Promise<void> {
    // Clean up any global resources
    await TestDatabaseSetup.clearDatabase();
    console.log("🧹 Test suite cleanup completed");
  },

  /**
   * Setup before each test
   */
  async beforeEach(): Promise<void> {
    // Clear database before each test to ensure isolation
    await TestDatabaseSetup.clearDatabase();
  },

  /**
   * Cleanup after each test
   */
  async afterEach(): Promise<void> {
    // Any per-test cleanup can go here
  },
};
