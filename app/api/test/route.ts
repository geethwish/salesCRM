import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types/order";
import { HTTP_STATUS } from "@/lib/constants";

/**
 * Simple test endpoint to verify API functionality
 * GET /api/test - Returns basic system information
 */
export async function GET(request: NextRequest) {
  try {
    const testData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      vercel: {
        url: process.env.VERCEL_URL || null,
        region: process.env.VERCEL_REGION || null,
        deployment: process.env.VERCEL_GIT_COMMIT_SHA || null,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: {
          "user-agent": request.headers.get("user-agent"),
          "content-type": request.headers.get("content-type"),
          origin: request.headers.get("origin"),
        },
      },
      env_vars: {
        mongodb_uri_set: !!process.env.MONGODB_URI,
        mongodb_db_name_set: !!process.env.MONGODB_DB_NAME,
        jwt_secret_set: !!process.env.JWT_SECRET,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: testData,
        message: "Test endpoint working correctly",
      } as ApiResponse,
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        },
      }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "TEST_ERROR",
          message: (error as Error).message,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/test - Test POST request handling
 */
export async function POST(request: NextRequest) {
  try {
    let body: object | null = null;
    try {
      body = await request.json();
    } catch {
      body = { message: "No JSON body provided" };
    }

    const testData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      method: "POST",
      body: body,
      headers: {
        "content-type": request.headers.get("content-type"),
        authorization: request.headers.get("authorization")
          ? "Bearer [REDACTED]"
          : null,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: testData,
        message: "POST test endpoint working correctly",
      } as ApiResponse,
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
        },
      }
    );
  } catch (error) {
    console.error("POST test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "POST_TEST_ERROR",
          message: (error as Error).message,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * OPTIONS /api/test - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
