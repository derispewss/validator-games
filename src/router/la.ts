import { hitCoda, Result } from '../utils'

type LaServer = {
  name: string
  zoneId: number
}

/** Complete server list for LifeAfter */
const SERVER_MAP: Record<string, LaServer> = {
  miskatown:      { name: 'MiskaTown',      zoneId: 500001 },
  sandcastle:     { name: 'SandCastle',     zoneId: 500002 },
  mouthswamp:     { name: 'MouthSwamp',     zoneId: 500003 },
  redwoodtown:    { name: 'RedwoodTown',    zoneId: 500004 },
  obelisk:        { name: 'Obelisk',        zoneId: 500005 },
  newland:        { name: 'NewLand',        zoneId: 500006 },
  chaosoutpost:   { name: 'ChaosOutpost',   zoneId: 500007 },
  ironstride:     { name: 'IronStride',     zoneId: 500008 },
  crystalthornsea: { name: 'CrystalthornSea', zoneId: 500009 },
  fallforest:     { name: 'FallForest',     zoneId: 510001 },
  mountsnow:      { name: 'MountSnow',      zoneId: 510002 },
  nancycity:      { name: 'NancyCity',      zoneId: 520001 },
  charlestown:    { name: 'CharlesTown',    zoneId: 520002 },
  snowhighlands:  { name: 'SnowHighlands',  zoneId: 520003 },
  santopany:      { name: 'Santopany',      zoneId: 520004 },
  levincity:      { name: 'LevinCity',      zoneId: 520005 },
  milestone:      { name: 'MileStone',      zoneId: 520006 },
  chaoscity:      { name: 'ChaosCity',      zoneId: 520007 },
  twinislands:    { name: 'TwinIslands',    zoneId: 520008 },
  hopewall:       { name: 'HopeWall',       zoneId: 520009 },
  labyrinthsea:   { name: 'LabyrinthSea',   zoneId: 520010 },
}

/**
 * Validates a LifeAfter account via Codashop.
 * @param zone - Server name (case-insensitive, spaces ignored).
 */
export default async function la(id: number, zone: string): Promise<Result> {
  const key = zone.toLowerCase().replace(/\s+/g, '')
  const server = Object.entries(SERVER_MAP).find(([k]) => key.includes(k))?.[1]

  if (!server) {
    return { success: false, message: 'Not found' }
  }

  const body = [
    'voucherPricePoint.id=45713',
    'voucherPricePoint.price=15000',
    'voucherPricePoint.variablePrice=0',
    `user.userId=${id}`,
    `user.zoneId=${server.zoneId}`,
    'voucherTypeName=NETEASE_LIFEAFTER',
    'shopLang=id_ID',
  ].join('&')

  const data = await hitCoda(body)
  const username = data.confirmationFields?.username

  if (!username) {
    return { success: false, message: 'Not found' }
  }

  return {
    success: true,
    game: 'LifeAfter',
    id,
    server: server.name,
    name: username,
  }
}