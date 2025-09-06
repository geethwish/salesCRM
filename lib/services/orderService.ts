import mongoose from "mongoose";
import {
  Order,
  OrderQuery,
  OrderListResponse,
  OrderUpdate,
} from "@/lib/types/order";
import { validateDateRange } from "@/lib/utils/validation";
import { PerformanceTimer, PerformanceMetrics } from "@/lib/utils/performance";
import { connectToDatabase } from "@/lib/database/connection";
import {
  withDatabase,
  paginate,
  searchDocuments,
  getDateRange,
  handleDatabaseError,
} from "@/lib/database/utils";
import OrderModel, { IOrder } from "@/lib/models/Order";

/**
 * MongoDB-based data store for orders
 */
class OrderService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  /**
   * Initialize database connection
   */
  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await connectToDatabase();
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
    }
  }

  /**
   * Create a new order
   */
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
    userId?: string
  ): Promise<Order> {
    return withDatabase(async () => {
      try {
        // Ensure we have a userId (for user-scoped data)
        if (!userId) {
          throw new Error("User ID is required to create an order");
        }

        const orderDoc = new OrderModel({
          ...orderData,
          userId: new mongoose.Types.ObjectId(userId),
        });

        const savedOrder = await orderDoc.save();
        this.clearCache(); // Clear cache when data changes

        return savedOrder.toAPIResponse();
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string, userId?: string): Promise<Order | null> {
    return withDatabase(async () => {
      try {
        const filter: any = { _id: new mongoose.Types.ObjectId(id) };

        // Add user filter if userId is provided (for user-scoped data)
        if (userId) {
          filter.userId = new mongoose.Types.ObjectId(userId);
        }

        const order = await OrderModel.findOne(filter);
        return order ? order.toAPIResponse() : null;
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Update an existing order
   */
  async updateOrder(
    id: string,
    updateData: OrderUpdate,
    userId?: string
  ): Promise<Order | null> {
    return withDatabase(async () => {
      try {
        const filter: any = { _id: new mongoose.Types.ObjectId(id) };

        // Add user filter if userId is provided (for user-scoped data)
        if (userId) {
          filter.userId = new mongoose.Types.ObjectId(userId);
        }

        const updatedOrder = await OrderModel.findOneAndUpdate(
          filter,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (updatedOrder) {
          this.clearCache(); // Clear cache when data changes
          return updatedOrder.toAPIResponse();
        }

        return null;
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string, userId?: string): Promise<boolean> {
    return withDatabase(async () => {
      try {
        const filter: any = { _id: new mongoose.Types.ObjectId(id) };

        // Add user filter if userId is provided (for user-scoped data)
        if (userId) {
          filter.userId = new mongoose.Types.ObjectId(userId);
        }

        const result = await OrderModel.deleteOne(filter);

        if (result.deletedCount > 0) {
          this.clearCache(); // Clear cache when data changes
          return true;
        }

        return false;
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Get orders with filtering, pagination, and sorting
   */
  async getOrders(
    query: OrderQuery,
    userId?: string
  ): Promise<OrderListResponse> {
    return PerformanceTimer.timeAsync("getOrders", async () => {
      return withDatabase(async () => {
        try {
          const cacheKey = JSON.stringify({ ...query, userId });
          const cached = this.getFromCache(cacheKey);
          if (cached) {
            PerformanceMetrics.record("getOrders.cache_hit", 0);
            return cached;
          }

          PerformanceMetrics.record("getOrders.cache_miss", 0);

          // Build MongoDB filter
          const filter: any = {};

          // Add user filter if userId is provided (for user-scoped data)
          if (userId) {
            filter.userId = new mongoose.Types.ObjectId(userId);
          }

          // Apply filters
          if (query.category) {
            filter.category = new RegExp(query.category, "i");
          }

          if (query.source) {
            filter.source = new RegExp(query.source, "i");
          }

          if (query.geo) {
            filter.geo = new RegExp(query.geo, "i");
          }

          // Date range filtering
          if (query.dateFrom || query.dateTo) {
            if (!validateDateRange(query.dateFrom, query.dateTo)) {
              throw new Error("Invalid date range");
            }

            const dateFilter = getDateRange(query.dateFrom, query.dateTo);
            if (dateFilter) {
              // Convert string dates to Date objects for comparison
              if (query.dateFrom || query.dateTo) {
                filter.$expr = {
                  $and: [
                    ...(query.dateFrom
                      ? [
                          {
                            $gte: [
                              { $dateFromString: { dateString: "$date" } },
                              new Date(query.dateFrom),
                            ],
                          },
                        ]
                      : []),
                    ...(query.dateTo
                      ? [
                          {
                            $lte: [
                              { $dateFromString: { dateString: "$date" } },
                              new Date(query.dateTo),
                            ],
                          },
                        ]
                      : []),
                  ],
                };
              }
            }
          }

          // Build sort object
          const sort: any = {};
          const sortField =
            query.sortBy === "createdAt"
              ? "createdAt"
              : query.sortBy === "amount"
              ? "amount"
              : query.sortBy === "customer"
              ? "customer"
              : "date";
          sort[sortField] = query.sortOrder === "asc" ? 1 : -1;

          // Use search or regular query
          let result;
          if (query.search) {
            result = await searchDocuments(OrderModel, query.search, filter, {
              page: query.page,
              limit: query.limit,
              sortBy: sortField,
              sortOrder: query.sortOrder,
            });
          } else {
            result = await paginate(OrderModel, filter, {
              page: query.page,
              limit: query.limit,
              sortBy: sortField,
              sortOrder: query.sortOrder,
            });
          }

          // Transform data to API format
          const orders = result.data.map((order: IOrder) =>
            order.toAPIResponse()
          );

          const response: OrderListResponse = {
            orders,
            pagination: result.pagination,
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
        } catch (error) {
          handleDatabaseError(error);
        }
      });
    });
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId?: string) {
    return withDatabase(async () => {
      try {
        const cacheKey = `order-stats-${userId || "all"}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }

        // Build filter for user-scoped data
        const matchFilter: any = {};
        if (userId) {
          matchFilter.userId = new mongoose.Types.ObjectId(userId);
        }

        // Use MongoDB aggregation pipeline for statistics
        const pipeline = [
          ...(Object.keys(matchFilter).length > 0
            ? [{ $match: matchFilter }]
            : []),
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
              averageAmount: { $avg: { $ifNull: ["$amount", 0] } },
              categories: { $push: "$category" },
              sources: { $push: "$source" },
              locations: { $push: "$geo" },
            },
          },
        ];

        const [aggregateResult] = await OrderModel.aggregate(pipeline);

        if (!aggregateResult) {
          const emptyStats = {
            total: 0,
            byCategory: {},
            bySource: {},
            byLocation: {},
            totalAmount: 0,
            averageAmount: 0,
          };
          this.setCache(cacheKey, emptyStats, 10 * 60 * 1000);
          return emptyStats;
        }

        // Process categories, sources, and locations
        const byCategory: Record<string, number> = {};
        const bySource: Record<string, number> = {};
        const byLocation: Record<string, number> = {};

        aggregateResult.categories.forEach((category: string) => {
          byCategory[category] = (byCategory[category] || 0) + 1;
        });

        aggregateResult.sources.forEach((source: string) => {
          bySource[source] = (bySource[source] || 0) + 1;
        });

        aggregateResult.locations.forEach((location: string) => {
          byLocation[location] = (byLocation[location] || 0) + 1;
        });

        const stats = {
          total: aggregateResult.total,
          byCategory,
          bySource,
          byLocation,
          totalAmount: aggregateResult.totalAmount,
          averageAmount: aggregateResult.averageAmount || 0,
        };

        // Cache for 10 minutes
        this.setCache(cacheKey, stats, 10 * 60 * 1000);

        return stats;
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Clear all orders (for testing)
   */
  async clearAllOrders(userId?: string): Promise<void> {
    return withDatabase(async () => {
      try {
        const filter: any = {};
        if (userId) {
          filter.userId = new mongoose.Types.ObjectId(userId);
        }

        await OrderModel.deleteMany(filter);
        this.clearCache();
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Get total count of orders
   */
  async getOrderCount(userId?: string): Promise<number> {
    return withDatabase(async () => {
      try {
        const filter: any = {};
        if (userId) {
          filter.userId = new mongoose.Types.ObjectId(userId);
        }

        return await OrderModel.countDocuments(filter);
      } catch (error) {
        handleDatabaseError(error);
      }
    });
  }

  /**
   * Load seed data (used by seed script)
   */
  async loadSeedData(seedOrders: any[], userId: string): Promise<void> {
    return withDatabase(async () => {
      try {
        const ordersWithUserId = seedOrders.map((orderData) => ({
          ...orderData,
          userId: new mongoose.Types.ObjectId(userId),
        }));

        await OrderModel.insertMany(ordersWithUserId);
        this.clearCache();
      } catch (error) {
        handleDatabaseError(error);
      }
    });
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
