/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse, ApiError } from "@/lib/types/order";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error handler utility
 */
export class ErrorHandler {
  /**
   * Handle different types of errors and return appropriate API response
   */
  static handleError(error: unknown): NextResponse<ApiResponse> {
    console.error("API Error:", error);

    // Zod validation errors
    if (error instanceof ZodError) {
      const apiError: ApiError = {
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: "Request validation failed",
        statusCode: HTTP_STATUS.BAD_REQUEST,
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      };

      return NextResponse.json(
        {
          success: false,
          error: apiError,
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Custom validation errors
    if (error instanceof ValidationError) {
      const apiError: ApiError = {
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: error.message,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        details: error.details,
      };

      return NextResponse.json(
        {
          success: false,
          error: apiError,
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Not found errors
    if (error instanceof NotFoundError) {
      const apiError: ApiError = {
        error: ERROR_MESSAGES.ORDER_NOT_FOUND,
        message: error.message,
        statusCode: HTTP_STATUS.NOT_FOUND,
      };

      return NextResponse.json(
        {
          success: false,
          error: apiError,
        } as ApiResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Conflict errors
    if (error instanceof ConflictError) {
      const apiError: ApiError = {
        error: "Conflict",
        message: error.message,
        statusCode: HTTP_STATUS.CONFLICT,
      };

      return NextResponse.json(
        {
          success: false,
          error: apiError,
        } as ApiResponse,
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Generic errors
    if (error instanceof Error) {
      const apiError: ApiError = {
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred",
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };

      return NextResponse.json(
        {
          success: false,
          error: apiError,
        } as ApiResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Unknown errors
    const apiError: ApiError = {
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      message: "An unknown error occurred",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };

    return NextResponse.json(
      {
        success: false,
        error: apiError,
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  /**
   * Create a success response
   */
  static success<T>(
    data: T,
    status: number = HTTP_STATUS.OK
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      } as ApiResponse<T>,
      { status }
    );
  }

  /**
   * Create an error response
   */
  static error(
    error: string,
    message: string,
    statusCode: number,
    details?: any
  ): NextResponse<ApiResponse> {
    const apiError: ApiError = {
      error,
      message,
      statusCode,
      details,
    };

    return NextResponse.json(
      {
        success: false,
        error: apiError,
      } as ApiResponse,
      { status: statusCode }
    );
  }
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  };
}

/**
 * Rate limiting error
 */
export class RateLimitError extends Error {
  constructor(message: string = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(message: string = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}
