import { ALLOWED_METHODS, parseRequest } from './utils'
import serveResult from './helpers'

/**
 * Primary Cloudflare Worker entry point.
 *
 * Responsibilities:
 *  1. Reject unsupported HTTP methods early (405).
 *  2. Serve pre-flight OPTIONS requests for CORS compatibility.
 *  3. Delegate to the Cloudflare edge cache; populate the cache on a miss.
 *  4. Attach internal timing headers to every response.
 */
export default async function handleRequest(request: Request): Promise<Response> {
  const start = Date.now()

  // ── CORS pre-flight ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    })
  }

  // ── Method guard ──────────────────────────────────────────────────────────
  if (!ALLOWED_METHODS.includes(request.method as typeof ALLOWED_METHODS[number])) {
    return Response.json(
      { success: false, message: 'Method not allowed' },
      {
        status: 405,
        headers: {
          Allow: ALLOWED_METHODS.join(', '),
          ...corsHeaders(),
        },
      },
    )
  }

  // ── Normalise request into a canonical URL ─────────────────────────────────
  const canonicalUrl = await parseRequest(request)

  // ── Edge cache look-up ─────────────────────────────────────────────────────
  const cache = await caches.open('default')
  let response = await cache.match(canonicalUrl)

  if (!response) {
    response = await serveResult(canonicalUrl)
    // Only cache successful, cacheable responses
    if (response.status < 500) {
      await cache.put(canonicalUrl, response.clone())
    }
  }

  // Re-wrap so we can mutate the headers on an immutable cached response
  response = new Response(response.body, response)
  response.headers.set('X-Response-Time', String(Date.now() - start))

  return response
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'X-Response-Time',
  }
}