import { hitCoda, Result } from '../utils'

/**
 * Validates a VALORANT account via Codashop.
 *
 * Codashop returns two distinct success cases for VALORANT:
 *  - `success: true`  → account found with a username
 *  - `errorCode: -200` → account exists but has no display name yet
 *    (the Riot ID itself is the identifier in this case)
 */
export default async function valo(id: string): Promise<Result> {
  const body = [
    'voucherPricePoint.id=973634',
    'voucherPricePoint.price=56000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    'voucherTypeName=VALORANT',
    'voucherTypeId=109',
    'gvtId=139',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)

  if (data.success === true) {
    return {
      success: true,
      game: 'VALORANT',
      id,
      server: 'Indonesia',
      name: data.confirmationFields?.username ?? id,
    }
  }

  // Error code -200 indicates the account exists but has no display name yet
  if (data.errorCode === -200) {
    return {
      success: true,
      game: 'VALORANT',
      id,
      name: id,
    }
  }

  return { success: false, message: 'Not found' }
}