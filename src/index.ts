import handleRequest from './handler'

export interface Env {
  /**
   * Comma-separated list of allowed CORS origins.
   * Set via: npx wrangler secret put ALLOWED_ORIGINS
   * Example value: https://mystore.com,https://www.mystore.com,http://localhost:3000
   */
  ALLOWED_ORIGINS: string
}

export default {
  fetch: (request: Request, env: Env): Promise<Response> => handleRequest(request, env),
}