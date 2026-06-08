import { getParams, Result, ALLOWED_METHODS, toStandardResponse } from './utils'
import callAPI from './routing'
import { GAMES } from './games'

const CACHE_CONTROL = 'public, max-age=30, s-maxage=43200, stale-while-revalidate=60'

/**
 * Calls the appropriate game validator and serialises the result as a JSON
 * HTTP response with consistent headers.
 */
export default async function serveResult(url: string): Promise<Response> {
  const { path, decode } = getParams(url)

  if (path === '/games' || path === '/games/') {
    return Response.json({
      success: true,
      message: 'Success',
      games: GAMES,
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
        'Access-Control-Expose-Headers': '*',
        'Cache-Control': 'public, max-age=3600, s-maxage=43200',
      },
    })
  }

  const result: Result = await callAPI(url)

  // Fix Mobile Legends name encoding – the original mutation was a no-op
  // (String.replace is non-mutating); correct it here.
  if (result.game === 'Mobile Legends: Bang Bang' && typeof result.name === 'string') {
    result.name = result.name.replace(/\u002B/g, ' ')
  }

  // Decode percent-encoded characters in the username unless explicitly disabled
  if (typeof result.name === 'string') {
    const shouldDecode = decode === null || decode === undefined || decode !== 'false'
    if (shouldDecode) {
      try {
        result.name = decodeURIComponent(result.name)
      } catch {
        // Name contained invalid escape sequences – leave it as-is
      }
    }
  }

  const status = httpStatusFromResult(result)
  const standardResponse = toStandardResponse(result)

  return Response.json(standardResponse, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Expose-Headers': '*',
      'Cache-Control': status < 400 ? CACHE_CONTROL : 'no-store',
    },
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function httpStatusFromResult(result: Result): number {
  if (result.success) return 200

  switch (result.message) {
    case 'Bad request':
      return 400
    case 'Not found':
      return 404
    case 'Method not allowed':
      return 405
    default:
      return 500
  }
}