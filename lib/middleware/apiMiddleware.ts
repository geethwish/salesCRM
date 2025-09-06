/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types/order";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/**
 * Add CORS headers to response
 */
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Request logging middleware
 */
export function logRequest(request: NextRequest, startTime?: number): void {
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "Unknown";

  const duration = startTime ? Date.now() - startTime : 0;

  console.log(
    `[${new Date().toISOString()}] ${method} ${url} - ${ip} - ${userAgent}${
      duration ? ` - ${duration}ms` : ""
    }`
  );
}

/**
 * Validate content type for POST/PUT requests
 */
export function validateContentType(request: NextRequest): boolean {
  const method = request.method;
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    const contentType = request.headers.get("content-type");
    return contentType?.includes("application/json") || false;
  }
  return true;
}

/**
 * Rate limiting (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.windowMs;
    }
    return record.resetTime;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Apply rate limiting
 */
export function checkRateLimit(request: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const allowed = rateLimiter.isAllowed(ip);
  const remaining = rateLimiter.getRemainingRequests(ip);
  const resetTime = rateLimiter.getResetTime(ip);

  return { allowed, remaining, resetTime };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(resetTime / 1000).toString()
  );
  return response;
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Rate Limit Exceeded",
        message: "Too many requests. Please try again later.",
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      },
    } as ApiResponse,
    { status: 429 }
  );
}

/**
 * Validate request size
 */
export function validateRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 1024 * 1024
): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSizeBytes;
  }
  return true;
}

/**
 * Security headers
 */
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'",
};

/**
 * Add security headers to response
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * API middleware wrapper
 */
export function withApiMiddleware(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      // Handle OPTIONS requests
      if (request.method === "OPTIONS") {
        return handleOptions();
      }

      // Validate content type
      if (!validateContentType(request)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: ERROR_MESSAGES.VALIDATION_ERROR,
              message: "Content-Type must be application/json",
              statusCode: HTTP_STATUS.BAD_REQUEST,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      // Validate request size
      if (!validateRequestSize(request)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: ERROR_MESSAGES.VALIDATION_ERROR,
              message: "Request body too large",
              statusCode: HTTP_STATUS.BAD_REQUEST,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      // Check rate limit
      const rateLimit = checkRateLimit(request);
      if (!rateLimit.allowed) {
        const response = createRateLimitResponse();
        return addRateLimitHeaders(response, 0, rateLimit.resetTime);
      }

      // Execute handler
      const response = await handler(request, context);

      // Add middleware headers
      const enhancedResponse = withCors(withSecurityHeaders(response));
      addRateLimitHeaders(
        enhancedResponse,
        rateLimit.remaining,
        rateLimit.resetTime
      );

      // Log request
      logRequest(request, startTime);

      return enhancedResponse;
    } catch (error) {
      console.error("API Middleware Error:", error);

      const errorResponse = NextResponse.json(
        {
          success: false,
          error: {
            error: ERROR_MESSAGES.INTERNAL_ERROR,
            message: "Internal server error",
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );

      return withCors(withSecurityHeaders(errorResponse));
    }
  };
}
