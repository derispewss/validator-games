import { ALLOWED_METHODS, parseRequest, toStandardResponse } from './utils'
import serveResult from './helpers'
import type { Env } from './index'

/**
 * Primary Cloudflare Worker entry point.
 *
 * CORS origins are loaded at runtime from the `ALLOWED_ORIGINS` secret,
 * stored as a comma-separated string in Cloudflare Workers Secrets.
 *
 * Set via:
 *   npx wrangler secret put ALLOWED_ORIGINS
 *   → https://mystore.com,https://www.mystore.com,http://localhost:3000
 *
 * Responsibilities:
 *  1. Parse ALLOWED_ORIGINS secret into an origin allowlist.
 *  2. Validate the request Origin against the allowlist.
 *  3. Reject unsupported HTTP methods (405).
 *  4. Serve pre-flight OPTIONS requests for CORS compatibility.
 *  5. Delegate to Cloudflare edge cache; populate the cache on a miss.
 *  6. Attach X-Response-Time header to every response.
 */
export default async function handleRequest(request: Request, env: Env): Promise<Response> {
  const start = Date.now()

  // Parse allowed origins from the secret (comma-separated, trimmed)
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS)

  const origin = request.headers.get('Origin') ?? ''
  const isAllowed = origin !== '' && allowedOrigins.has(origin)

  // ── CORS pre-flight ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: isAllowed ? buildCorsHeaders(origin) : {},
    })
  }

  // ── Origin check (browser requests only — skip if no Origin header) ────────
  if (origin && !isAllowed) {
    return Response.json(
      toStandardResponse({ success: false, message: 'Forbidden' }),
      { status: 403 },
    )
  }

  // ── Method guard ──────────────────────────────────────────────────────────
  if (!ALLOWED_METHODS.includes(request.method as typeof ALLOWED_METHODS[number])) {
    return Response.json(
      toStandardResponse({ success: false, message: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          Allow: ALLOWED_METHODS.join(', '),
          ...( isAllowed ? buildCorsHeaders(origin) : {} ),
        },
      },
    )
  }

  // ── Normalise request into a canonical URL ─────────────────────────────────
  const canonicalUrl = await parseRequest(request)

  // ── Edge cache look-up ─────────────────────────────────────────────────────
  // TypeScript's DOM lib types may not include `caches.default` (Cloudflare Workers
  // exposes `caches.default`). Cast to the expected shape to satisfy the compiler.
  const cache = (caches as unknown as { default: Cache }).default
  let response = await cache.match(canonicalUrl)

  if (!response) {
    response = await serveResult(canonicalUrl)
    // Only cache successful/client-error responses — not 5xx
    if (response.status < 500) {
      await cache.put(canonicalUrl, response.clone())
    }
  }

  // Re-wrap so we can mutate headers on an immutable cached response
  response = new Response(response.body, response)

  // Inject CORS headers for allowed origins
  if (isAllowed) {
    for (const [key, value] of Object.entries(buildCorsHeaders(origin))) {
      response.headers.set(key, value)
    }
  }

  response.headers.set('X-Response-Time', String(Date.now() - start))

  return response
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parses the comma-separated ALLOWED_ORIGINS secret into a Set for O(1) lookup. */
function parseAllowedOrigins(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw.split(',').map(o => o.trim()).filter(Boolean)
  )
}

function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':   origin,
    'Access-Control-Allow-Methods':  ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers':  'Content-Type, Accept',
    'Access-Control-Expose-Headers': 'X-Response-Time',
    'Access-Control-Max-Age':        '86400',
    'Vary':                          'Origin',
  }
}