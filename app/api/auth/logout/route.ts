import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/order';
import { withApiMiddleware } from '@/lib/middleware/apiMiddleware';
import { 
  HTTP_STATUS, 
  SUCCESS_MESSAGES,
  COOKIE_CONFIG 
} from '@/lib/constants';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and clear authentication cookies
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
 */
async function logoutHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      } as ApiResponse,
      { status: HTTP_STATUS.OK }
    );

    // Clear authentication cookies
    const cookieOptions = {
      httpOnly: COOKIE_CONFIG.HTTP_ONLY,
      secure: COOKIE_CONFIG.SECURE,
      sameSite: COOKIE_CONFIG.SAME_SITE,
      path: COOKIE_CONFIG.PATH,
      maxAge: 0, // Expire immediately
    };

    response.cookies.set(COOKIE_CONFIG.AUTH_TOKEN, '', cookieOptions);
    response.cookies.set(COOKIE_CONFIG.REMEMBER_ME, '', cookieOptions);

    return response;

  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: 'Logout Error',
          message: 'Failed to logout. Please try again.',
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Apply middleware and export
export const POST = withApiMiddleware(logoutHandler);
