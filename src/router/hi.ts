import { hitCoda, Result } from '../utils'

/** Validates a Honkai Impact 3rd account via Codashop. */
export default async function hi(id: number): Promise<Result> {
  const body = [
    'voucherPricePoint.id=48250',
    'voucherPricePoint.price=16500',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    'user.zoneId=',
    'voucherTypeName=HONKAI_IMPACT',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Honkai Impact 3rd',
    id,
    name: username,
  }
}