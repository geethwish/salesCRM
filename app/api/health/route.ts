import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, getConnectionStatus } from '@/lib/database/connection';
import { ApiResponse } from '@/lib/types/order';
import { HTTP_STATUS } from '@/lib/constants';

/**
 * GET /api/health - Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    const connectionStatus = getConnectionStatus();
    
    // Determine overall health status
    const isHealthy = dbHealth.status === 'healthy' && connectionStatus.isConnected;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealth.status,
        connected: dbHealth.details.connected,
        readyState: dbHealth.details.readyState,
        host: dbHealth.details.host,
        name: dbHealth.details.name,
        collections: dbHealth.details.collections,
        lastError: dbHealth.details.lastError,
      },
      connection: {
        isConnected: connectionStatus.isConnected,
        isConnecting: connectionStatus.isConnecting,
        connectionAttempts: connectionStatus.connectionAttempts,
        lastConnectionAttempt: connectionStatus.lastConnectionAttempt,
        lastError: connectionStatus.lastError?.message,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    const statusCode = isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    return NextResponse.json(
      {
        success: isHealthy,
        data: healthData,
      } as ApiResponse,
      { status: statusCode }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: (error as Error).message,
        },
      } as ApiResponse,
      { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
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
        error: 'METHOD_NOT_ALLOWED',
        message: 'POST method not allowed on health check endpoint',
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
        error: 'METHOD_NOT_ALLOWED',
        message: 'PUT method not allowed on health check endpoint',
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
        error: 'METHOD_NOT_ALLOWED',
        message: 'DELETE method not allowed on health check endpoint',
        statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
      },
    } as ApiResponse,
    { status: HTTP_STATUS.METHOD_NOT_ALLOWED }
  );
}
