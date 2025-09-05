import { NextRequest, NextResponse } from "next/server";
import { LoginRequestSchema, AuthResponse } from "@/lib/types/auth";
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
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: Password123!
 *               rememberMe:
 *                 type: boolean
 *                 description: Whether to extend session duration
 *                 default: false
 *     responses:
 *       200:
 *         description: Login successful
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
 *         description: Invalid request data
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
async function loginHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request body
    const validationResult = await validateRequestBody(
      request,
      LoginRequestSchema
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

    const loginData = validationResult.data;

    // Authenticate user
    const user = await userService.loginUser(loginData);

    // Generate JWT token
    const token = generateToken(user, loginData.rememberMe);
    const expiresIn = getTokenExpirationTime(loginData.rememberMe);

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
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      } as ApiResponse<AuthResponse>,
      { status: HTTP_STATUS.OK }
    );

    // Set authentication cookie
    const cookieOptions = {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge: loginData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
    };

    response.cookies.set(COOKIE_CONFIG.AUTH_TOKEN, token, cookieOptions);

    if (loginData.rememberMe) {
      response.cookies.set(COOKIE_CONFIG.REMEMBER_ME, "true", {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Authentication Failed",
              message: ERROR_MESSAGES.INVALID_CREDENTIALS,
              statusCode: HTTP_STATUS.UNAUTHORIZED,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      if (error.message === ERROR_MESSAGES.ACCOUNT_DISABLED) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Account Disabled",
              message: ERROR_MESSAGES.ACCOUNT_DISABLED,
              statusCode: HTTP_STATUS.FORBIDDEN,
            },
          } as ApiResponse,
          { status: HTTP_STATUS.FORBIDDEN }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: "Login failed. Please try again.",
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Apply middleware and export
export const POST = withApiMiddleware(loginHandler);
