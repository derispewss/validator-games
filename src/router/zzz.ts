import { hitCoda, Result } from '../utils'

type ZzzServer = {
  name: string
  zoneId: string
}

const SERVER_MAP: Record<string, ZzzServer> = {
  '10': { name: 'America',                        zoneId: 'prod_gf_us' },
  '13': { name: 'Asia',                           zoneId: 'prod_gf_jp' },
  '15': { name: 'Europe',                         zoneId: 'prod_gf_eu' },
  '17': { name: 'SAR (Taiwan, Hong Kong, Macao)', zoneId: 'prod_gf_sg' },
}

/**
 * Validates a Zenless Zone Zero account via Codashop.
 * Server is inferred from the first two digits of the UID.
 */
export default async function zzz(id: number): Promise<Result> {
  const prefix = id.toString().substring(0, 2)
  const server = SERVER_MAP[prefix]

  if (!server) {
    return { success: false, message: 'Bad request' }
  }

  const body = [
    'voucherPricePoint.id=946399',
    'voucherPricePoint.price=16000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${server.zoneId}`,
    'voucherTypeName=ZENLESS_ZONE_ZERO',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Zenless Zone Zero',
    id,
    server: server.name,
    name: username,
  }
}