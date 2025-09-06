/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { connectToDatabase } from "./connection";

// Database operation wrapper with error handling
export async function withDatabase<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Ensure database connection
      await connectToDatabase();

      // Execute the operation
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Log the error
      console.error(
        `Database operation attempt ${attempt}/${retries} failed:`,
        error
      );

      // Check if it's a connection error that might be retryable
      const isRetryableError =
        error instanceof mongoose.Error.MongooseServerSelectionError ||
        (error as any).code === "ECONNRESET" ||
        (error as any).code === "ETIMEDOUT" ||
        (error as any).name === "MongoNetworkError";

      // If it's the last attempt or not a retryable error, throw
      if (attempt === retries || !isRetryableError) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Database operation failed after all retries");
}

// Transaction wrapper
export async function withTransaction<T>(
  operations: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  return withDatabase(async () => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const result = await operations(session);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  });
}

// Pagination utility
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  model: mongoose.Model<T>,
  filter: any = {},
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    model.countDocuments(filter).exec(),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

// Search utility with text search
export async function searchDocuments<T>(
  model: mongoose.Model<T>,
  searchQuery: string,
  filter: any = {},
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  // Add text search to filter if search query is provided
  const searchFilter = searchQuery
    ? {
        ...filter,
        $text: { $search: searchQuery },
      }
    : filter;

  // Add text score sorting if searching
  const sortOptions = searchQuery
    ? { score: { $meta: "textScore" }, ...buildSortObject(options) }
    : buildSortObject(options);

  const { page, limit } = options;
  const skip = (page - 1) * limit;

  // Execute queries
  const [data, total] = await Promise.all([
    model.find(searchFilter).sort(sortOptions).skip(skip).limit(limit).exec(),
    model.countDocuments(searchFilter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Helper function to build sort object
function buildSortObject(options: PaginationOptions): any {
  const { sortBy = "createdAt", sortOrder = "desc" } = options;
  const sort: any = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  return sort;
}

// Aggregation utility
export async function aggregateWithPagination<T>(
  model: mongoose.Model<any>,
  pipeline: any[],
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  // Create aggregation pipeline with pagination
  const aggregationPipeline = [
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await model.aggregate(aggregationPipeline).exec();

  const data = result.data || [];
  const total = result.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Bulk operations utility
export async function bulkWrite<T>(
  model: mongoose.Model<T>,
  operations: any[],
  options: { ordered?: boolean; session?: mongoose.ClientSession } = {}
): Promise<mongoose.mongo.BulkWriteResult> {
  return withDatabase(async () => {
    return model.bulkWrite(operations, {
      ordered: options.ordered ?? false,
      session: options.session,
    });
  });
}

// Index management utilities
export async function ensureIndexes(model: mongoose.Model<any>): Promise<void> {
  return withDatabase(async () => {
    await model.ensureIndexes();
    console.log(`✅ Indexes ensured for ${model.modelName}`);
  });
}

export async function dropIndexes(model: mongoose.Model<any>): Promise<void> {
  return withDatabase(async () => {
    await model.collection.dropIndexes();
    console.log(`🗑️ Indexes dropped for ${model.modelName}`);
  });
}

// Collection utilities
export async function dropCollection(
  model: mongoose.Model<any>
): Promise<void> {
  return withDatabase(async () => {
    try {
      await model.collection.drop();
      console.log(`🗑️ Collection ${model.collection.name} dropped`);
    } catch (error) {
      // Ignore error if collection doesn't exist
      if ((error as any).code !== 26) {
        throw error;
      }
    }
  });
}

export async function getCollectionStats(
  model: mongoose.Model<any>
): Promise<any> {
  return withDatabase(async () => {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    return db.command({ collStats: model.collection.collectionName });
  });
}

// Validation utilities
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
}

// Date utilities for MongoDB queries
export function getDateRange(dateFrom?: string, dateTo?: string): any {
  const dateFilter: any = {};

  if (dateFrom) {
    dateFilter.$gte = new Date(dateFrom);
  }

  if (dateTo) {
    // Add one day to include the entire end date
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    dateFilter.$lt = endDate;
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

// Error handling utilities
export function handleDatabaseError(error: any): never {
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    throw new Error(`Validation error: ${messages.join(", ")}`);
  }

  if (error instanceof mongoose.Error.CastError) {
    throw new Error(`Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    throw new Error(`Duplicate value for ${field}`);
  }

  throw error;
}
