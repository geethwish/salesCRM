import { NextRequest, NextResponse } from "next/server";
import { RegisterRequestSchema, AuthResponse } from "@/lib/types/auth";
import { ApiResponse } from "@/lib/types/order";
import { userService } from "@/lib/services/userService";
import { generateToken, getTokenExpirationTime } from "@/lib/utils/auth";
import { validateRequestBody } from "@/lib/utils/validation";
import { withApiMiddleware } from "@/lib/middleware/apiMiddleware";
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COOKIE_CONFIG,
} from "@/lib/constants";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - acceptTerms
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: User's password (must meet security requirements)
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation
 *                 example: Password123!
 *               acceptTerms:
 *                 type: boolean
 *                 description: Whether user accepts terms of service
 *                 example: true
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/PublicUser'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *                     expiresIn:
 *                       type: number
 *                       description: Token expiration time in seconds
 *       400:
 *         description: Invalid request data or validation errors
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
async function registerHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request body
    const validationResult = await validateRequestBody(
      request,
      RegisterRequestSchema
    );

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        } as ApiResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const registerData = validationResult.data;

    // Register user
    const user = await userService.registerUser(registerData);

    // Generate JWT token (auto-login after registration)
    const token = generateToken(user, false);
    const expiresIn = getTokenExpirationTime(false);

    // Create auth response
    const authResponse: AuthResponse = {
      user,
      token,
      expiresIn,
    };

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        data: authResponse,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      } as ApiResponse<AuthResponse>,
      { status: HTTP_STATUS.CREATED }
    );

    // Set authentication cookie
    const cookieOptions = {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge: 24 * 60 * 60, // 24 hours
    };

    response.cookies.set(COOKIE_CONFIG.AUTH_TOKEN, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific registration errors
    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.EMAIL_ALREADY_EXISTS) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Registration Failed",
              message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
              statusCode: HTTP_STATUS.CONFLICT,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.CONFLICT }
        );
      }

      if (error.message.includes("Password")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Validation Error",
              message: error.message,
              statusCode: HTTP_STATUS.BAD_REQUEST,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      if (error.message === ERROR_MESSAGES.TERMS_NOT_ACCEPTED) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Terms Required",
              message: ERROR_MESSAGES.TERMS_NOT_ACCEPTED,
              statusCode: HTTP_STATUS.BAD_REQUEST,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Registration failed. Please try again.",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Apply middleware and export
export const POST = withApiMiddleware(registerHandler);
