import { hitCoda, Result } from '../utils'

/** Validates a Sausage Man account via Codashop. */
export default async function sm(id: string): Promise<Result> {
  const body = [
    'voucherPricePoint.id=256513',
    'voucherPricePoint.price=16000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    'user.zoneId=global-release',
    'voucherTypeName=SAUSAGE_MAN',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Sausage Man',
    id,
    name: username,
  }
}
