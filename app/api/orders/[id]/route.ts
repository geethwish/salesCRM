import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";
import { OrderUpdateSchema, ApiResponse } from "@/lib/types/order";
import { validateRequestBody, isValidUUID } from "@/lib/utils/validation";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     description: Retrieve a single order by its unique identifier
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique identifier of the order
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
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
 *         description: Bad request - Invalid order ID format
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Order not found
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
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validate order ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.INVALID_ORDER_ID,
            message: "Invalid order ID format",
            statusCode: HTTP_STATUS.BAD_REQUEST,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Get order from service
    const order = await orderService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.ORDER_NOT_FOUND,
            message: `Order with ID ${id} not found`,
            statusCode: HTTP_STATUS.NOT_FOUND,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`GET /api/orders/${params.id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to retrieve order",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PUT /api/orders/[id] - Update a specific order
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validate order ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.INVALID_ORDER_ID,
            message: "Invalid order ID format",
            statusCode: HTTP_STATUS.BAD_REQUEST,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate request body
    const validation = await validateRequestBody(request, OrderUpdateSchema);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse,
        { status: validation.error.statusCode }
      );
    }

    const updateData = validation.data;

    // Update order
    const updatedOrder = await orderService.updateOrder(id, updateData);

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.ORDER_NOT_FOUND,
            message: `Order with ID ${id} not found`,
            statusCode: HTTP_STATUS.NOT_FOUND,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`PUT /api/orders/${params.id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to update order",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/orders/[id] - Delete a specific order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Validate order ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.INVALID_ORDER_ID,
            message: "Invalid order ID format",
            statusCode: HTTP_STATUS.BAD_REQUEST,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Delete order
    const deleted = await orderService.deleteOrder(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.ORDER_NOT_FOUND,
            message: `Order with ID ${id} not found`,
            statusCode: HTTP_STATUS.NOT_FOUND,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: "Order deleted successfully" },
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`DELETE /api/orders/${params.id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to delete order",
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
