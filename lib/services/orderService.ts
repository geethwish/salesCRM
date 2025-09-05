import { v4 as uuidv4 } from "uuid";
import {
  Order,
  OrderQuery,
  OrderListResponse,
  OrderUpdate,
} from "@/lib/types/order";
import { validateDateRange } from "@/lib/utils/validation";
import { PerformanceTimer, PerformanceMetrics } from "@/lib/utils/performance";

/**
 * In-memory data store for orders
 */
class OrderService {
  private orders: Map<string, Order> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  /**
   * Initialize with sample data
   */
  constructor() {
    this.seedSampleData();
  }

  /**
   * Create a new order
   */
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
  ): Promise<Order> {
    const id = uuidv4();
    const now = new Date();

    const order: Order = {
      ...orderData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(id, order);
    this.clearCache(); // Clear cache when data changes

    return order;
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  /**
   * Update an existing order
   */
  async updateOrder(
    id: string,
    updateData: OrderUpdate
  ): Promise<Order | null> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return null;
    }

    const updatedOrder: Order = {
      ...existingOrder,
      ...updateData,
      updatedAt: new Date(),
    };

    this.orders.set(id, updatedOrder);
    this.clearCache(); // Clear cache when data changes

    return updatedOrder;
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<boolean> {
    const deleted = this.orders.delete(id);
    if (deleted) {
      this.clearCache(); // Clear cache when data changes
    }
    return deleted;
  }

  /**
   * Get orders with filtering, pagination, and sorting
   */
  async getOrders(query: OrderQuery): Promise<OrderListResponse> {
    return PerformanceTimer.timeAsync("getOrders", async () => {
      const cacheKey = JSON.stringify(query);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        PerformanceMetrics.record("getOrders.cache_hit", 0);
        return cached;
      }

      PerformanceMetrics.record("getOrders.cache_miss", 0);

      let filteredOrders = Array.from(this.orders.values());

      // Apply filters
      if (query.category) {
        filteredOrders = filteredOrders.filter((order) =>
          order.category.toLowerCase().includes(query.category!.toLowerCase())
        );
      }

      if (query.source) {
        filteredOrders = filteredOrders.filter((order) =>
          order.source.toLowerCase().includes(query.source!.toLowerCase())
        );
      }

      if (query.geo) {
        filteredOrders = filteredOrders.filter((order) =>
          order.geo.toLowerCase().includes(query.geo!.toLowerCase())
        );
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.customer.toLowerCase().includes(searchTerm) ||
            order.id.toLowerCase().includes(searchTerm) ||
            order.category.toLowerCase().includes(searchTerm) ||
            order.source.toLowerCase().includes(searchTerm) ||
            order.geo.toLowerCase().includes(searchTerm)
        );
      }

      // Date range filtering
      if (query.dateFrom || query.dateTo) {
        if (!validateDateRange(query.dateFrom, query.dateTo)) {
          throw new Error("Invalid date range");
        }

        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.date);

          if (query.dateFrom) {
            const fromDate = new Date(query.dateFrom);
            if (orderDate < fromDate) return false;
          }

          if (query.dateTo) {
            const toDate = new Date(query.dateTo);
            if (orderDate > toDate) return false;
          }

          return true;
        });
      }

      // Sorting
      filteredOrders.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (query.sortBy) {
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "customer":
            aValue = a.customer.toLowerCase();
            bValue = b.customer.toLowerCase();
            break;
          case "amount":
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case "createdAt":
            aValue = a.createdAt || new Date(0);
            bValue = b.createdAt || new Date(0);
            break;
          default:
            aValue = new Date(a.date);
            bValue = new Date(b.date);
        }

        if (query.sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Pagination
      const total = filteredOrders.length;
      const totalPages = Math.ceil(total / query.limit);
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      const response: OrderListResponse = {
        orders: paginatedOrders,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
          hasNext: query.page < totalPages,
          hasPrev: query.page > 1,
        },
        filters: {
          category: query.category,
          source: query.source,
          geo: query.geo,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          search: query.search,
        },
      };

      // Cache the response for 5 minutes
      this.setCache(cacheKey, response, 5 * 60 * 1000);

      return response;
    });
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    const cacheKey = "order-stats";
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const orders = Array.from(this.orders.values());

    const stats = {
      total: orders.length,
      byCategory: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      totalAmount: 0,
      averageAmount: 0,
    };

    orders.forEach((order) => {
      // Count by category
      stats.byCategory[order.category] =
        (stats.byCategory[order.category] || 0) + 1;

      // Count by source
      stats.bySource[order.source] = (stats.bySource[order.source] || 0) + 1;

      // Count by location
      stats.byLocation[order.geo] = (stats.byLocation[order.geo] || 0) + 1;

      // Sum amounts
      if (order.amount) {
        stats.totalAmount += order.amount;
      }
    });

    stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

    // Cache for 10 minutes
    this.setCache(cacheKey, stats, 10 * 60 * 1000);

    return stats;
  }

  /**
   * Clear all orders (for testing)
   */
  async clearAllOrders(): Promise<void> {
    this.orders.clear();
    this.clearCache();
  }

  /**
   * Get total count of orders
   */
  async getOrderCount(): Promise<number> {
    return this.orders.size;
  }

  /**
   * Seed sample data
   */
  private seedSampleData(): void {
    // Sample data will be loaded via the seed script
    // This method is kept for potential future use
  }

  /**
   * Load seed data (used by seed script)
   */
  async loadSeedData(seedOrders: any[]): Promise<void> {
    for (const orderData of seedOrders) {
      await this.createOrder(orderData);
    }
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const orderService = new OrderService();
export default orderService;
