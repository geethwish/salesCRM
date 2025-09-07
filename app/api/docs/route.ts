import { NextResponse } from "next/server";

/**
 * GET /api/docs - Serve Swagger UI documentation
 */
export async function GET() {
  try {
    // Generate simple HTML documentation page with Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales CRM API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            display: none;
        }
        .swagger-ui .info {
            margin: 20px 0;
        }
        .swagger-ui .info .title {
            color: #3b82f6;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-family: Arial, sans-serif;
            color: #666;
        }
        .loading::after {
            content: '';
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error {
            padding: 20px;
            text-align: center;
            color: #d32f2f;
            font-family: Arial, sans-serif;
        }
        .error ul {
            text-align: left;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div id="swagger-ui">
        <div class="loading">Loading API Documentation...</div>
    </div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    <script>
        // Handle browser extension interference
        function initializeSwaggerUI() {
            try {
                // Check if SwaggerUIBundle is available
                if (typeof SwaggerUIBundle === 'undefined') {
                    console.error('SwaggerUIBundle is not loaded. Please check your internet connection.');
                    document.getElementById('swagger-ui').innerHTML =
                        '<div style="padding: 20px; text-align: center; color: #d32f2f;">' +
                        '<h2>⚠️ Swagger UI Failed to Load</h2>' +
                        '<p>The Swagger UI JavaScript bundle could not be loaded.</p>' +
                        '<p>This might be due to:</p>' +
                        '<ul style="text-align: left; display: inline-block;">' +
                        '<li>Network connectivity issues</li>' +
                        '<li>Browser extension interference</li>' +
                        '<li>Content Security Policy restrictions</li>' +
                        '</ul>' +
                        '<p><a href="/api/docs/openapi.json" target="_blank">View Raw OpenAPI JSON</a></p>' +
                        '</div>';
                    return;
                }

                // Check if SwaggerUIStandalonePreset is available
                if (typeof SwaggerUIStandalonePreset === 'undefined') {
                    console.error('SwaggerUIStandalonePreset is not loaded.');
                    return;
                }

                // Initialize Swagger UI
                const ui = SwaggerUIBundle({
                    url: '/api/docs/openapi.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    onComplete: function() {
                        console.log('Swagger UI loaded successfully');
                    },
                    onFailure: function(error) {
                        console.error('Swagger UI failed to load:', error);
                    }
                });
            } catch (error) {
                console.error('Error initializing Swagger UI:', error);
                document.getElementById('swagger-ui').innerHTML =
                    '<div style="padding: 20px; text-align: center; color: #d32f2f;">' +
                    '<h2>⚠️ Error Loading Swagger UI</h2>' +
                    '<p>An error occurred while initializing the API documentation.</p>' +
                    '<p>Error: ' + error.message + '</p>' +
                    '<p><a href="/api/docs/openapi.json" target="_blank">View Raw OpenAPI JSON</a></p>' +
                    '</div>';
            }
        }

        // Initialize when page loads, with fallback for extension interference
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeSwaggerUI);
        } else {
            initializeSwaggerUI();
        }

        // Fallback initialization after a delay
        setTimeout(function() {
            if (document.getElementById('swagger-ui').innerHTML.trim() === '') {
                initializeSwaggerUI();
            }
        }, 2000);
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        // Override CSP for Swagger UI documentation page
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com https://unpkg.com data:",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    });
  } catch (error) {
    console.error("Swagger UI error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "Documentation Error",
          message: "Failed to load API documentation",
          statusCode: 500,
        },
      },
      { status: 500 }
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
        error: "Method Not Allowed",
        message: "POST method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "PUT method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "DELETE method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: {
        error: "Method Not Allowed",
        message: "PATCH method not allowed on this endpoint",
        statusCode: 405,
      },
    },
    { status: 405 }
  );
}
