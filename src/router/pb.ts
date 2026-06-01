import { hitCoda, Result } from '../utils'

/** Validates a Point Blank account via Codashop. */
export default async function pb(id: string): Promise<Result> {
  const body = [
    'voucherPricePoint.id=54700',
    'voucherPricePoint.price=11000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    'user.zoneId=',
    'voucherTypeName=POINT_BLANK',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Point Blank',
    id,
    name: username,
  }
}