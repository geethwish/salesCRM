import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/order';
import { PublicUser } from '@/lib/types/auth';
import { userService } from '@/lib/services/userService';
import { authenticateRequest } from '@/lib/utils/auth';
import { withApiMiddleware } from '@/lib/middleware/apiMiddleware';
import { 
  HTTP_STATUS, 
  ERROR_MESSAGES 
} from '@/lib/constants';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get current authenticated user information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PublicUser'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
async function getMeHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authPayload = authenticateRequest(request);
    
    if (!authPayload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: 'Authentication Required',
            message: ERROR_MESSAGES.UNAUTHORIZED,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Get user information
    const user = await userService.getUserById(authPayload.userId);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: 'User Not Found',
            message: ERROR_MESSAGES.USER_NOT_FOUND,
            statusCode: HTTP_STATUS.NOT_FOUND,
          },
        } as ApiResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      } as ApiResponse<PublicUser>,
      { status: HTTP_STATUS.OK }
    );

  } catch (error) {
    console.error('Get me error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message: 'Failed to get user information.',
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Apply middleware and export
export const GET = withApiMiddleware(getMeHandler);
