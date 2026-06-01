import { hitCoda, Result } from '../utils'

type HsrServer = {
  name: string
  zoneId: string
}

const SERVER_MAP: Record<string, HsrServer> = {
  '6': { name: 'America',                        zoneId: 'prod_official_usa'  },
  '7': { name: 'Europe',                         zoneId: 'prod_official_eur'  },
  '8': { name: 'Asia',                           zoneId: 'prod_official_asia' },
  '9': { name: 'SAR (Taiwan, Hong Kong, Macao)', zoneId: 'prod_official_cht'  },
}

/**
 * Validates a Honkai: Star Rail account via Codashop.
 * Server is inferred from the first digit of the UID.
 */
export default async function hsr(id: number): Promise<Result> {
  const server = SERVER_MAP[id.toString()[0]]

  if (!server) {
    return { success: false, message: 'Not found' }
  }

  const body = [
    'voucherPricePoint.id=855316',
    'voucherPricePoint.price=16000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${server.zoneId}`,
    'voucherTypeName=HONKAI_STAR_RAIL',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Honkai: Star Rail',
    id,
    server: server.name,
    name: username,
  }
}