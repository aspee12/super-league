/**
 * Dummy team→players mapping for score update dropdowns.
 * Keys are team names (matched against team.name from Payload).
 */
export const TEAM_PLAYERS: Record<string, string[]> = {
  'Single Aunty': [
    'Sonam Dorji',
    'Karma Tshering',
    'Pema Dorji',
    'Tashi Wangchuk',
    'Lhamo Dorji',
  ],
  'Aunti Jaram': [
    'Yeshi Norbu',
    'Kinley Dorji',
    'Sangay Tshering',
    'Dorji Wangmo',
    'Tenzin Dorji',
  ],
  'Double Trouble': [
    'Sonam Tashi',
    'Karma Wangdi',
    'Pema Tshering',
    'Tashi Dorji',
    'Lhamo Tshering',
  ],
  'Bros United': [
    'Pema Wangchuk',
    'Karma Dorji',
    'Sonam Wang',
    'Tashi Pema',
    'Dorji Tshering',
  ],
  'Red Dragon': [
    'Tashi Dorji',
    'Lhamo Tshering',
    'Karma Wangchuk',
    'Sonam Pem',
    'Kinley Wangdi',
  ],
  'Mini Lions': [
    'Karma Tshering',
    'Pema Lhamo',
    'Sonam Yangzom',
    'Tashi Norbu',
    'Dorji Wangchuk',
  ],
  'Aunty jaram': [
    'Sangay Dorji',
    'Tenzin Wangmo',
    'Karma Pem',
    'Pema Norbu',
    'Sonam Dorji',
  ],
  Uncles: [
    'Kinley Tshering',
    'Dorji Pema',
    'Karma Sangay',
    'Tashi Wangmo',
    'Sonam Tshering',
  ],
  'Blue kak': [
    'Pema Dorji',
    'Karma Lhamo',
    'Tashi Sangay',
    'Sonam Kinley',
    'Dorji Norbu',
  ],
  'Green tea': [
    'Tenzin Dorji',
    'Karma Yangzom',
    'Pema Tashi',
    'Sonam Wangdi',
    'Tashi Lhamo',
  ],
  'Red apple': [
    'Dorji Tashi',
    'Karma Norbu',
    'Pema Sangay',
    'Sonam Pema',
    'Tashi Kinley',
  ],
}

/** Get players for a team by name. Returns empty array if not found. */
export function getPlayersForTeam(teamName: string): string[] {
  return TEAM_PLAYERS[teamName] ?? []
}
