import { hitCoda, Result } from '../utils'

type GenshinServer = {
  name: string
  zoneId: string
}

const SERVER_MAP: Record<string, GenshinServer> = {
  '6': { name: 'America',                      zoneId: 'os_usa'  },
  '7': { name: 'Europe',                       zoneId: 'os_euro' },
  '8': { name: 'Asia',                         zoneId: 'os_asia' },
  '9': { name: 'SAR (Taiwan, Hong Kong, Macao)', zoneId: 'os_cht' },
}

/**
 * Validates a Genshin Impact account via Codashop.
 * Server is inferred from the first digit(s) of the UID.
 */
export default async function gi(id: number): Promise<Result> {
  const idStr = id.toString()

  // UIDs starting with '18' or '8x' belong to the Asia server
  const serverKey = (idStr.startsWith('18') || idStr[0] === '8') ? '8' : idStr[0]
  const server = SERVER_MAP[serverKey]

  if (!server) {
    return { success: false, message: 'Not found' }
  }

  const body = [
    'voucherPricePoint.id=116054',
    'voucherPricePoint.price=16500',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${server.zoneId}`,
    'voucherTypeName=GENSHIN_IMPACT',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Genshin Impact',
    id,
    server: server.name,
    name: username,
  }
}
