import { NextResponse } from "next/server";
import { orderService } from "@/lib/services/orderService";
import { ApiResponse } from "@/lib/types/order";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";
import { sampleOrders } from "@/scripts/seed";
import { connectToDatabase } from "@/lib/database/connection";
import UserModel from "@/lib/models/User";
import OrderModel from "@/lib/models/Order";

/**
 * POST /api/seed - Seed the database with sample data
 */
export async function POST() {
  try {
    console.log("🌱 Starting database seeding via API...");

    // Ensure database connection
    await connectToDatabase();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("🗑️  Cleared existing orders and users");

    // Create superadmin account
    console.log("👤 Creating superadmin account...");
    const superadminData = {
      email: "admin@crm.com",
      password: "password", // Will be hashed by pre-save middleware
      name: "Super Admin",
      role: "admin" as const,
      isActive: true,
      emailVerified: true,
    };

    const superadmin = new UserModel(superadminData);
    const savedSuperadmin = await superadmin.save();
    console.log(`✅ Created superadmin account: ${savedSuperadmin.email}`);

    // Create sample orders associated with superadmin
    console.log("📦 Creating sample orders...");
    let createdCount = 0;
    for (const orderData of sampleOrders) {
      try {
        await orderService.createOrder(
          orderData,
          savedSuperadmin._id.toString()
        );
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Failed to create order for ${orderData.customer}:`,
          error
        );
      }
    }

    console.log(`✅ Successfully created ${createdCount} orders`);

    // Get statistics
    const stats = await orderService.getOrderStats(
      savedSuperadmin._id.toString()
    );

    const result = {
      message: "Database seeded successfully",
      superadmin: {
        email: savedSuperadmin.email,
        name: savedSuperadmin.name,
        role: savedSuperadmin.role,
      },
      created: createdCount,
      statistics: stats,
    };

    console.log("🎉 Database seeding completed successfully via API!");

    return NextResponse.json(
      {
        success: true,
        data: result,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error("❌ Database seeding failed via API:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Failed to seed database",
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
        message:
          "GET method not allowed on this endpoint. Use POST to seed data.",
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
