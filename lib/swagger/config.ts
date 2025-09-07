import swaggerJsdoc from "swagger-jsdoc";
import { getApiBaseUrl } from "@/lib/utils/apiConfig";

// Get the appropriate server URLs based on environment
const getServerUrls = (): Array<{ url: string; description: string }> => {
  const baseUrl = getApiBaseUrl();
  const servers: Array<{ url: string; description: string }> = [];

  // Always include the current environment's URL
  if (process.env.NODE_ENV === "production") {
    servers.push({
      url: baseUrl,
      description: "Production server",
    });
  } else {
    servers.push({
      url: baseUrl,
      description: "Development server",
    });

    // Also include localhost for development
    if (baseUrl !== "http://localhost:3000") {
      servers.push({
        url: "http://localhost:3000",
        description: "Local development server",
      });
    }
  }

  return servers;
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sales CRM API",
      version: "1.0.0",
      description:
        "A comprehensive Sales CRM API for managing orders with filtering, pagination, and analytics",
      contact: {
        name: "API Support",
        email: "support@salescrm.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: getServerUrls(),
    components: {
      schemas: {
        Order: {
          type: "object",
          required: ["id", "customer", "category", "date", "source", "geo"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the order",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            customer: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Customer name",
              example: "Alice Smith",
            },
            category: {
              type: "string",
              enum: [
                "Electronics",
                "Clothing",
                "Books",
                "Home & Garden",
                "Sports",
                "Automotive",
                "Health & Beauty",
                "Toys & Games",
              ],
              description: "Product category",
              example: "Electronics",
            },
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "Order date in YYYY-MM-DD format",
              example: "2025-09-01",
            },
            source: {
              type: "string",
              enum: ["Online", "Store", "Phone", "Mobile App", "Social Media"],
              description: "Order source",
              example: "Online",
            },
            geo: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Geographic location",
              example: "New York",
            },
            amount: {
              type: "number",
              minimum: 0,
              description: "Order amount",
              example: 1299.99,
            },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              description: "Order status",
              example: "delivered",
              default: "pending",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
              example: "2025-09-01T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              example: "2025-09-01T10:30:00.000Z",
            },
          },
        },
        OrderInput: {
          type: "object",
          required: ["customer", "category", "date", "source", "geo"],
          properties: {
            customer: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Customer name",
              example: "Alice Smith",
            },
            category: {
              type: "string",
              enum: [
                "Electronics",
                "Clothing",
                "Books",
                "Home & Garden",
                "Sports",
                "Automotive",
                "Health & Beauty",
                "Toys & Games",
              ],
              description: "Product category",
              example: "Electronics",
            },
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "Order date in YYYY-MM-DD format",
              example: "2025-09-01",
            },
            source: {
              type: "string",
              enum: ["Online", "Store", "Phone", "Mobile App", "Social Media"],
              description: "Order source",
              example: "Online",
            },
            geo: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Geographic location",
              example: "New York",
            },
            amount: {
              type: "number",
              minimum: 0,
              description: "Order amount",
              example: 1299.99,
            },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              description: "Order status",
              example: "delivered",
              default: "pending",
            },
          },
        },
        OrderUpdate: {
          type: "object",
          properties: {
            customer: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Customer name",
              example: "Alice Smith",
            },
            category: {
              type: "string",
              enum: [
                "Electronics",
                "Clothing",
                "Books",
                "Home & Garden",
                "Sports",
                "Automotive",
                "Health & Beauty",
                "Toys & Games",
              ],
              description: "Product category",
              example: "Electronics",
            },
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "Order date in YYYY-MM-DD format",
              example: "2025-09-01",
            },
            source: {
              type: "string",
              enum: ["Online", "Store", "Phone", "Mobile App", "Social Media"],
              description: "Order source",
              example: "Online",
            },
            geo: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Geographic location",
              example: "New York",
            },
            amount: {
              type: "number",
              minimum: 0,
              description: "Order amount",
              example: 1299.99,
            },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              description: "Order status",
              example: "delivered",
            },
          },
        },
        OrderListResponse: {
          type: "object",
          properties: {
            orders: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Order",
              },
              description: "Array of orders",
            },
            pagination: {
              type: "object",
              properties: {
                page: {
                  type: "integer",
                  description: "Current page number",
                  example: 1,
                },
                limit: {
                  type: "integer",
                  description: "Number of items per page",
                  example: 10,
                },
                total: {
                  type: "integer",
                  description: "Total number of orders",
                  example: 100,
                },
                totalPages: {
                  type: "integer",
                  description: "Total number of pages",
                  example: 10,
                },
                hasNext: {
                  type: "boolean",
                  description: "Whether there is a next page",
                  example: true,
                },
                hasPrev: {
                  type: "boolean",
                  description: "Whether there is a previous page",
                  example: false,
                },
              },
            },
            filters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Applied category filter",
                  example: "Electronics",
                },
                source: {
                  type: "string",
                  description: "Applied source filter",
                  example: "Online",
                },
                geo: {
                  type: "string",
                  description: "Applied location filter",
                  example: "New York",
                },
                dateFrom: {
                  type: "string",
                  description: "Applied date from filter",
                  example: "2025-09-01",
                },
                dateTo: {
                  type: "string",
                  description: "Applied date to filter",
                  example: "2025-09-30",
                },
                search: {
                  type: "string",
                  description: "Applied search filter",
                  example: "Alice",
                },
              },
            },
          },
        },
        OrderStats: {
          type: "object",
          properties: {
            total: {
              type: "integer",
              description: "Total number of orders",
              example: 100,
            },
            byCategory: {
              type: "object",
              additionalProperties: {
                type: "integer",
              },
              description: "Orders count by category",
              example: {
                Electronics: 25,
                Clothing: 20,
                Books: 15,
              },
            },
            bySource: {
              type: "object",
              additionalProperties: {
                type: "integer",
              },
              description: "Orders count by source",
              example: {
                Online: 40,
                Store: 30,
                Phone: 20,
                "Mobile App": 10,
              },
            },
            byLocation: {
              type: "object",
              additionalProperties: {
                type: "integer",
              },
              description: "Orders count by location",
              example: {
                "New York": 15,
                California: 12,
                Texas: 10,
              },
            },
            totalAmount: {
              type: "number",
              description: "Total amount of all orders",
              example: 50000.0,
            },
            averageAmount: {
              type: "number",
              description: "Average order amount",
              example: 500.0,
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Whether the request was successful",
              example: true,
            },
            data: {
              description: "Response data (varies by endpoint)",
            },
            error: {
              $ref: "#/components/schemas/ApiError",
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error type",
              example: "Validation error",
            },
            message: {
              type: "string",
              description: "Error message",
              example: "Invalid input data",
            },
            statusCode: {
              type: "integer",
              description: "HTTP status code",
              example: 400,
            },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    description: "Field name with error",
                    example: "customer",
                  },
                  message: {
                    type: "string",
                    description: "Field-specific error message",
                    example: "Customer name is required",
                  },
                  code: {
                    type: "string",
                    description: "Error code",
                    example: "too_small",
                  },
                },
              },
              description: "Detailed validation errors",
            },
          },
        },
      },
    },
  },
  apis: ["./app/api/**/*.ts"], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
