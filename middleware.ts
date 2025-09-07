import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Enhanced security headers for production deployment
 * These headers help prevent extension interference and improve security
 */
const securityHeaders = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Enable XSS protection (legacy, but still useful)
  "X-XSS-Protection": "1; mode=block",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Comprehensive Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://unpkg.com", // Allow Vercel analytics and Swagger UI
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com", // Allow Google Fonts and Swagger UI styles
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: https://vercel.live", // Allow API calls and WebSocket
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Prevent DNS prefetching to external domains
  "X-DNS-Prefetch-Control": "off",

  // Strict Transport Security (HTTPS only)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Permissions Policy (formerly Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", "),
};

/**
 * CORS headers for API routes
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Special handling for Swagger UI documentation page
  if (request.nextUrl.pathname === "/api/docs") {
    // Don't apply strict CSP to docs page - it handles its own CSP
    const docsSecurityHeaders = { ...securityHeaders };
    delete docsSecurityHeaders["Content-Security-Policy"];

    Object.entries(docsSecurityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  } else {
    // Add security headers to all other responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          ...corsHeaders,
          ...securityHeaders,
        },
      });
    }
  }

  // Add cache control for static assets
  if (request.nextUrl.pathname.startsWith("/_next/static/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Add security headers for HTML pages
  if (
    request.nextUrl.pathname.endsWith(".html") ||
    !request.nextUrl.pathname.includes(".")
  ) {
    response.headers.set("X-Robots-Tag", "index, follow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
