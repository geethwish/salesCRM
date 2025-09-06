import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger/config";

/**
 * GET /api/docs/openapi.json - Serve OpenAPI specification as JSON
 */
export async function GET() {
  try {
    return NextResponse.json(swaggerSpec, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("OpenAPI JSON error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "Documentation Error",
          message: "Failed to generate OpenAPI specification",
          statusCode: 500,
        },
      },
      { status: 500 }
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
        error: "Method Not Allowed",
        message: "POST method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "PUT method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "DELETE method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "PATCH method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}
