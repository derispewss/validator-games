import { hitCoda, Result } from '../utils'

/** Validates an Arena of Valor (AOV) account via Codashop. */
export default async function aov(id: number): Promise<Result> {
  const body = `user.userId=${id}&voucherPricePoint.id=7946&voucherPricePoint.price=10000&shopLang=id_ID&voucherTypeName=AOV`
  const data = await hitCoda(body)

  const role = data.confirmationFields?.roles?.[0]
  if (!role?.role) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Garena: AOV (Arena Of Valor)',
    id,
    name: role.role,
    server: role.server,
  }
}
