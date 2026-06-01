import { hitCoda, Result } from '../utils'

/** Validates a Call of Duty: Mobile account via Codashop. */
export default async function codm(id: number): Promise<Result> {
  const body = `user.userId=${id}&voucherPricePoint.id=46129&voucherPricePoint.price=10000&shopLang=id_ID&voucherTypeName=CALL_OF_DUTY`
  const data = await hitCoda(body)

  const role = data.confirmationFields?.roles?.[0]
  if (!role?.role) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Call Of Duty Mobile',
    id,
    name: role.role,
    server: role.server,
  }
}
