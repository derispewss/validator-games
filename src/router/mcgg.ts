import { hitCoda, Result } from '../utils'

/** Validates a Magic Chess: Go Go account via Codashop. */
export default async function mcgg(id: number, zone: number): Promise<Result> {
  if (!zone) {
    return { success: false, message: 'Bad request' }
  }

  const body = [
    'voucherPricePoint.id=997117',
    'voucherPricePoint.price=1579',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${zone}`,
    'voucherTypeName=106-MAGIC_CHESS',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Magic Chess: Go Go',
    id,
    server: zone,
    name: username,
  }
}