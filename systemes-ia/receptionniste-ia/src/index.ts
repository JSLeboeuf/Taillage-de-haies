import { handleVAPIWebhook, type CloudflareEnv } from './webhook-handler';

interface Env extends CloudflareEnv {
  ENVIRONMENT?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'haie-lite-receptionniste',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // VAPI webhook handler
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const response = await handleVAPIWebhook(request, env);

        // Add CORS headers to response
        const newResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });

        return newResponse;
      } catch (error) {
        console.error('[index] Webhook error:', error);
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }

    // 404
    return new Response(
      JSON.stringify({
        error: 'Not found',
        available_endpoints: {
          'GET /': 'Health check',
          'POST /webhook': 'VAPI webhook handler',
        },
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};
