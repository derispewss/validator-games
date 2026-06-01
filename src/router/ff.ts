import { Result } from '../utils'

/** Validates a Garena Free Fire account via GoPay's game API. */
export default async function ff(id: number): Promise<Result> {
  const response = await fetch(`https://gopay.co.id/games/v1/order/prepare/FREEFIRE?userId=${id}`)

  if (!response.ok) {
    return { success: false, message: 'Not found' }
  }

  const data = await response.json<{ data?: string }>()

  if (!data.data) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'Garena Free Fire',
    id,
    name: data.data,
  }
}