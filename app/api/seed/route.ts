import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services/orderService';
import { ApiResponse } from '@/lib/types/order';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';
import { sampleOrders } from '@/scripts/seed';

/**
 * POST /api/seed - Seed the database with sample data
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding via API...');
    
    // Clear existing data
    await orderService.clearAllOrders();
    console.log('🗑️  Cleared existing orders');

    // Create sample orders
    let createdCount = 0;
    for (const orderData of sampleOrders) {
      try {
        await orderService.createOrder(orderData);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create order for ${orderData.customer}:`, error);
      }
    }

    console.log(`✅ Successfully created ${createdCount} orders`);
    
    // Get statistics
    const stats = await orderService.getOrderStats();
    
    const result = {
      message: 'Database seeded successfully',
      created: createdCount,
      statistics: stats,
    };

    console.log('🎉 Database seeding completed successfully via API!');

    return NextResponse.json(
      {
        success: true,
        data: result,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('❌ Database seeding failed via API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: 'Failed to seed database',
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
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        message: 'GET method not allowed on this endpoint. Use POST to seed data.',
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
        message: 'PUT method not allowed on this endpoint',
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
        message: 'DELETE method not allowed on this endpoint',
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
        message: 'PATCH method not allowed on this endpoint',
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}
