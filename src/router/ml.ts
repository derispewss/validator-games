import { Result } from '../utils'

interface MlbbApiResponse {
  name?: string
  countryName?: string
}

/**
 * Validates a Mobile Legends: Bang Bang account.
 * Uses a dedicated MLBB validation endpoint (not Codashop).
 */
export default async function ml(id: number, zone: number): Promise<Result> {
  if (!zone) {
    return { success: false, message: 'Bad request' }
  }

  const response = await fetch(`https://mlbb-api.isan.eu.org/find?id=${id}&zone=${zone}`)

  if (!response.ok) {
    return { success: false, message: 'Not found' }
  }

  const data = await response.json<MlbbApiResponse>()

  if (!data.name) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Mobile Legends: Bang Bang',
    id,
    server: zone,
    name: data.name,
    country: data.countryName,
  }
}
