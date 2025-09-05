import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";
import { ApiResponse } from "@/lib/types/order";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     description: Retrieve comprehensive statistics about orders including totals, breakdowns by category, source, and location
 *     tags:
 *       - Orders
 *       - Statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OrderStats'
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
    // Get statistics from service
    const stats = await orderService.getOrderStats();

    return NextResponse.json(
      {
        success: true,
        data: stats,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("GET /api/orders/stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to retrieve order statistics",
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
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        message: "POST method not allowed on this endpoint",
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}

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
