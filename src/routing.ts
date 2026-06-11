import { getParams, Result } from './utils'
import * as router from './router'

// Games that require a `server` / `zone` parameter in addition to `id`
const ZONE_REQUIRED = new Set(['/la', '/mcgg', '/ml', '/pgr'])

/**
 * Resolves the request URL to the correct game validator and returns a
 * structured result object.
 */
export default async function callAPI(url: string): Promise<Result> {
  const { path, id, server, zone } = getParams(url)
  const resolvedServer = server ?? zone

  if (!id) {
    return { success: false, message: 'Bad request' }
  }

  // Require `server` / `zone` for games that need it
  const matchedZoneRoute = [...ZONE_REQUIRED].find(r => path.includes(r))
  if (matchedZoneRoute && !resolvedServer) {
    return { success: false, message: 'Bad request' }
  }

  try {
    if (path.includes('/aov')) return await router.aov(Number(id))
    if (path.includes('/codm')) return await router.codm(Number(id))
    if (path.includes('/ff')) return await router.ff(Number(id))
    if (path.includes('/gi')) return await router.gi(Number(id))
    if (path.includes('/hi')) return await router.hi(Number(id))
    if (path.includes('/hsr')) return await router.hsr(Number(id))
    if (path.includes('/la')) return await router.la(Number(id), resolvedServer!)
    if (path.includes('/ld')) return await router.lad(Number(id))
    if (path.includes('/mcgg')) return await router.mcgg(Number(id), Number(resolvedServer))
    if (path.includes('/ml')) return await router.ml(Number(id), Number(resolvedServer))
    if (path.includes('/pb')) return await router.pb(id)
    if (path.includes('/pgr')) return await router.pgr(Number(id), resolvedServer!)
    if (path.includes('/sm')) return await router.sm(id)
    if (path.includes('/sus')) return await router.sus(Number(id))
    if (path.includes('/valo')) return await router.valo(id)
    if (path.includes('/zzz')) return await router.zzz(Number(id))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[callAPI] ${path} error:`, message)
    return { success: false, message: 'Internal server error' }
  }

  return { success: false, message: 'Bad request' }
}