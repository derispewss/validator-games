import { hitCoda, Result } from '../utils'

export default async function ml(id: number, zone: number): Promise<Result> {
/*
Kamu bisa langsung kirim request ke: https://mlbb-api.isan.eu.org/find
Dengan menyertakan parameter id & zone
Endpoint ini di deploy di Vercel dengan WAF standar
Meringirim banyak request dalam waktu singkat dapat menyebabkan WAF aktif
*/
  const request = await fetch(`https://mlbb-api.isan.eu.org/find?id=${id}&zone=${zone}`)
  const data = await request.json()
  return {
    success: true,
    game: 'Mobile Legends: Bang Bang',
    id,
    server: zone,
    name: data.name,
    country: data.countryName
  }
}
