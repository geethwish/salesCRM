import { z } from "zod";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/types/order";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: "Request body validation failed",
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        },
      };
    }

    return {
      success: false,
      error: {
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: "Invalid JSON in request body",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: ApiError } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    console.error(
      "Query validation error:",
      error,
      "Type:",
      typeof error,
      "Constructor:",
      error?.constructor?.name
    );

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          message: "Query parameters validation failed",
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        },
      };
    }

    return {
      success: false,
      error: {
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: "Invalid query parameters",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
    };
  }
}

/**
 * Validates date range
 */
export function validateDateRange(dateFrom?: string, dateTo?: string): boolean {
  if (!dateFrom || !dateTo) return true;

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  return from <= to;
}

/**
 * Sanitizes string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
