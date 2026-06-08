export interface GameInfo {
  endpoint: string
  name: string
  params: string[]
}

export const GAMES: GameInfo[] = [
  { endpoint: '/aov',  name: 'Arena of Valor',                 params: ['id (number)'] },
  { endpoint: '/codm', name: 'Call of Duty: Mobile',           params: ['id (number)'] },
  { endpoint: '/ff',   name: 'Garena Free Fire',               params: ['id (number)'] },
  { endpoint: '/gi',   name: 'Genshin Impact',                 params: ['id (number)'] },
  { endpoint: '/hi',   name: 'Honkai Impact 3rd',              params: ['id (number)'] },
  { endpoint: '/hsr',  name: 'Honkai: Star Rail',              params: ['id (number)'] },
  { endpoint: '/la',   name: 'LifeAfter',                      params: ['id (number)', 'server/zone (string)'] },
  { endpoint: '/ld',   name: 'Love and Deepspace',             params: ['id (number)'] },
  { endpoint: '/mcgg', name: 'Magic Chess: Go Go',             params: ['id (number)', 'server/zone (number)'] },
  { endpoint: '/ml',   name: 'Mobile Legends: Bang Bang',      params: ['id (number)', 'zone/server (number)'] },
  { endpoint: '/pb',   name: 'Point Blank',                    params: ['id (string)'] },
  { endpoint: '/pgr',  name: 'Punishing: Gray Raven',          params: ['id (number)', 'server/zone (string)'] },
  { endpoint: '/sm',   name: 'Sausage Man',                    params: ['id (string)'] },
  { endpoint: '/sus',  name: 'Super Sus',                      params: ['id (number)'] },
  { endpoint: '/valo', name: 'VALORANT',                       params: ['id (string) - Format: Username#TAG'] },
  { endpoint: '/zzz',  name: 'Zenless Zone Zero',              params: ['id (number)'] },
]
