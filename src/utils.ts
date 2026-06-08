export const ALLOWED_METHODS = ['GET', 'HEAD', 'POST'] as const

export type AllowedMethod = typeof ALLOWED_METHODS[number]

/**
 * Parses an incoming HTTP request and normalises all parameters
 * (GET query string + POST body) into a single canonical URL string.
 */
export async function parseRequest(request: Request): Promise<string> {
  const url = new URL(request.url)

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') ?? ''

    try {
      let data: Record<string, string> = {}

      if (contentType.includes('application/json')) {
        const json = await request.json()
        for (const [key, value] of Object.entries(json)) {
          if (value !== null && value !== undefined) {
            data[key] = String(value)
          }
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        for (const [key, value] of formData.entries()) {
          data[key] = String(value)
        }
      }

      for (const [key, value] of Object.entries(data)) {
        url.searchParams.set(key, value)
      }
    } catch {
      // Malformed body – fall back to the raw URL without modifications
    }
  }

  return url.href
}

/**
 * Extracts well-known route parameters from a canonical URL string.
 */
export function getParams(inputUrl: string): RouteParams {
  const url = new URL(inputUrl)
  const params: RouteParams = { path: url.pathname }

  for (const [key, value] of url.searchParams.entries()) {
    params[key as keyof RouteParams] = value as never
  }

  return params
}

/**
 * Fires a validation request against the Codashop order endpoint.
 * Throws on non-2xx responses or network failures.
 */
export async function hitCoda(body: string): Promise<CodaResponse> {
  const response = await fetch('https://order-sg.codashop.com/initPayment.action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`Upstream responded with HTTP ${response.status}`)
  }

  const data = await response.json()
  return data as CodaResponse
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RouteParams {
  path: string
  id?: string
  server?: string
  zone?: string
  decode?: string
}

export interface CodaResponse {
  success?: boolean
  errorCode?: number
  confirmationFields?: {
    username?: string
    roles?: Array<{ role: string; server: string }>
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface Result {
  success: boolean
  game?: string
  id?: number | string
  server?: string | number
  name?: string | number
  country?: string
  message?: string
}

export interface StandardResponse {
  success: boolean
  message: string | null
  game: string | null
  id: string | null
  server: string | null
  name: string | null
  country: string | null
}

export function toStandardResponse(result: Partial<Result> & { success: boolean }): StandardResponse {
  return {
    success: result.success,
    message: result.message !== undefined && result.message !== null ? String(result.message) : (result.success ? 'Success' : 'Unknown error'),
    game: result.game !== undefined && result.game !== null ? String(result.game) : null,
    id: result.id !== undefined && result.id !== null ? String(result.id) : null,
    server: result.server !== undefined && result.server !== null ? String(result.server) : null,
    name: result.name !== undefined && result.name !== null ? String(result.name) : null,
    country: result.country !== undefined && result.country !== null ? String(result.country) : null,
  }
}