import { hitCoda, Result } from '../utils'

type PgrServer = {
  name: string
  zoneId: string
}

const SERVER_MAP: Record<string, PgrServer> = {
  ap: { name: 'Asia-Pacific',  zoneId: '5000' },
  eu: { name: 'Europe',        zoneId: '5001' },
  na: { name: 'North America', zoneId: '5002' },
}

/**
 * Validates a Punishing: Gray Raven account via Codashop.
 * @param zone - Server region code: 'ap' | 'eu' | 'na' (case-insensitive).
 */
export default async function pgr(id: number, zone: string): Promise<Result> {
  const server = SERVER_MAP[zone.toLowerCase()]

  if (!server) {
    return { success: false, message: 'Bad request' }
  }

  const body = [
    'voucherPricePoint.id=259947',
    'voucherPricePoint.price=15000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${server.zoneId}`,
    'voucherTypeName=PUNISHING_GRAY_RAVEN',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Punishing: Gray Raven',
    id,
    server: server.name,
    name: username,
  }
}