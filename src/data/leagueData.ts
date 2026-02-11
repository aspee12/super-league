export interface Team {
  id: string;
  position: number;
  name: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>;
}

export const teamsData: Team[] = [
  {
    id: '1',
    position: 1,
    name: 'Mini Lions',
    logo: '🦁',
    played: 12,
    won: 1,
    drawn: 2,
    lost: 9,
    goalsFor: 28,
    goalsAgainst: 1,
    goalDifference: 18,
    points: 29,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  {
    id: '2',
    position: 2,
    name: 'Single Aunti',
    logo: '👩',
    played: 12,
    won: 1,
    drawn: 2,
    lost: 9,
    goalsFor: 28,
    goalsAgainst: 1,
    goalDifference: 18,
    points: 29,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  {
    id: '3',
    position: 3,
    name: 'Aunty jaram',
    logo: '👨‍🦱',
    played: 12,
    won: 1,
    drawn: 2,
    lost: 9,
    goalsFor: 28,
    goalsAgainst: 1,
    goalDifference: 18,
    points: 29,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  {
    id: '4',
    position: 4,
    name: 'Uncles',
    logo: '👴',
    played: 12,
    won: 1,
    drawn: 2,
    lost: 9,
    goalsFor: 28,
    goalsAgainst: 1,
    goalDifference: 18,
    points: 29,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  {
    id: '5',
    position: 5,
    name: 'Loud Speaker',
    logo: '🦅',
    played: 10,
    won: 28,
    drawn: 25,
    lost: 55,
    goalsFor: 40,
    goalsAgainst: 33,
    goalDifference: 7,
    points: 91,
    form: ['W', 'D', 'W', 'L', 'W'],
  },
];
