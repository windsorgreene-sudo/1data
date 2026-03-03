import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for Mapbox token requests
const ALLOWED_ORIGINS = [
  'https://uumjpywglgclamrvitcr.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Only allow specific origins
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin to prevent token abuse
  const isValidOrigin = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith('.lovable.app')
  );
  
  if (!isValidOrigin) {
    console.warn(`Rejected request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: 'Unauthorized origin' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error("MAPBOX_PUBLIC_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: 'MAPBOX_PUBLIC_TOKEN not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Mapbox token retrieved for origin: ${origin}`);

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching Mapbox token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve map configuration' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
