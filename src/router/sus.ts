import { hitCoda, Result } from '../utils'

/** Validates a Super Sus account via Codashop. */
export default async function sus(id: number): Promise<Result> {
  const body = [
    'voucherPricePoint.id=266077',
    'voucherPricePoint.price=13000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    'user.zoneId=',
    'voucherTypeName=SUPER_SUS',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Super Sus',
    id,
    name: username,
  }
}
