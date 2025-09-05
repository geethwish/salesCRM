import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";
import { OrderQuerySchema, OrderSchema, ApiResponse } from "@/lib/types/order";
import {
  validateQueryParams,
  validateRequestBody,
} from "@/lib/utils/validation";
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders with filtering, pagination, and sorting
 *     description: Retrieve a list of orders with optional filtering by category, source, location, date range, and search terms. Supports pagination and sorting.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, customer, amount, createdAt]
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by order source
 *       - in: query
 *         name: geo
 *         schema:
 *           type: string
 *         description: Filter by geographic location
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Filter orders from this date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Filter orders to this date (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in customer name, order ID, category, source, or location
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrderListResponse'
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       $ref: '#/components/schemas/ApiError'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(searchParams, OrderQuerySchema);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse,
        { status: validation.error.statusCode }
      );
    }

    const query = validation.data;

    // Get orders from service
    const result = await orderService.getOrders(query);

    return NextResponse.json(
      {
        success: true,
        data: result,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to retrieve orders",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with the provided details
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *           examples:
 *             example1:
 *               summary: Electronics order
 *               value:
 *                 customer: "Alice Smith"
 *                 category: "Electronics"
 *                 date: "2025-09-01"
 *                 source: "Online"
 *                 geo: "New York"
 *                 amount: 1299.99
 *                 status: "pending"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       $ref: '#/components/schemas/ApiError'
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(
      request,
      OrderSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      })
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse,
        { status: validation.error.statusCode }
      );
    }

    const orderData = validation.data;

    // Create order
    const newOrder = await orderService.createOrder(orderData);

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
      } as ApiResponse,
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to create order",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        message: "PUT method not allowed on this endpoint",
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        message: "DELETE method not allowed on this endpoint",
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        message: "PATCH method not allowed on this endpoint",
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}
