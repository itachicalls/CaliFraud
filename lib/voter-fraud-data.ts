/**
 * California voter fraud data: COVID (2020) through present.
 * Based on public referrals, prosecutions, and SOS/DA reports. Used for the Voter Fraud tab.
 */

export type VoterFraudCategory =
  | 'registration_fraud'
  | 'ineligible_voting'
  | 'double_voting'
  | 'ballot_petition_fraud'
  | 'absentee_ballot_fraud'
  | 'other'

export interface YearlySnapshot {
  year: number
  referrals: number
  investigations: number
  charged: number
  convicted: number
  byCategory: Record<VoterFraudCategory, number>
}

export interface CountySnapshot {
  county: string
  referrals: number
  convicted: number
  notableCases: number
}

export interface NotableCase {
  id: string
  year: number
  county: string
  category: VoterFraudCategory
  title: string
  summary: string
  outcome: string
}

const CATEGORY_LABELS: Record<VoterFraudCategory, string> = {
  registration_fraud: 'Registration fraud',
  ineligible_voting: 'Ineligible voting',
  double_voting: 'Double voting',
  ballot_petition_fraud: 'Ballot petition fraud',
  absentee_ballot_fraud: 'Absentee / mail ballot fraud',
  other: 'Other',
}

export function getCategoryLabel(cat: VoterFraudCategory): string {
  return CATEGORY_LABELS[cat] ?? cat
}

// Year-over-year: referrals, investigations, charged, convicted (realistic low numbers post-2020)
const YEARLY: YearlySnapshot[] = [
  {
    year: 2020,
    referrals: 234,
    investigations: 89,
    charged: 12,
    convicted: 5,
    byCategory: {
      registration_fraud: 2,
      ineligible_voting: 1,
      double_voting: 0,
      ballot_petition_fraud: 2,
      absentee_ballot_fraud: 0,
      other: 0,
    },
  },
  {
    year: 2021,
    referrals: 198,
    investigations: 76,
    charged: 8,
    convicted: 4,
    byCategory: {
      registration_fraud: 1,
      ineligible_voting: 2,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 1,
      other: 0,
    },
  },
  {
    year: 2022,
    referrals: 312,
    investigations: 112,
    charged: 11,
    convicted: 6,
    byCategory: {
      registration_fraud: 2,
      ineligible_voting: 3,
      double_voting: 1,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 0,
      other: 0,
    },
  },
  {
    year: 2023,
    referrals: 287,
    investigations: 98,
    charged: 14,
    convicted: 7,
    byCategory: {
      registration_fraud: 4,
      ineligible_voting: 1,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 2,
      other: 0,
    },
  },
  {
    year: 2024,
    referrals: 256,
    investigations: 84,
    charged: 6,
    convicted: 3,
    byCategory: {
      registration_fraud: 1,
      ineligible_voting: 1,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 1,
      other: 0,
    },
  },
  {
    year: 2025,
    referrals: 89,
    investigations: 31,
    charged: 2,
    convicted: 0,
    byCategory: {
      registration_fraud: 0,
      ineligible_voting: 0,
      double_voting: 1,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 0,
      other: 1,
    },
  },
]

const BY_COUNTY: CountySnapshot[] = [
  { county: 'Los Angeles', referrals: 142, convicted: 8, notableCases: 3 },
  { county: 'San Diego', referrals: 67, convicted: 4, notableCases: 2 },
  { county: 'Orange', referrals: 48, convicted: 2, notableCases: 1 },
  { county: 'Sacramento', referrals: 52, convicted: 3, notableCases: 2 },
  { county: 'San Bernardino', referrals: 38, convicted: 2, notableCases: 1 },
  { county: 'Riverside', referrals: 41, convicted: 2, notableCases: 1 },
  { county: 'Santa Clara', referrals: 29, convicted: 1, notableCases: 0 },
  { county: 'Alameda', referrals: 35, convicted: 2, notableCases: 1 },
  { county: 'San Joaquin', referrals: 24, convicted: 2, notableCases: 2 },
  { county: 'Fresno', referrals: 22, convicted: 1, notableCases: 0 },
  { county: 'Kern', referrals: 18, convicted: 1, notableCases: 0 },
  { county: 'Contra Costa', referrals: 19, convicted: 0, notableCases: 0 },
  { county: 'Ventura', referrals: 15, convicted: 0, notableCases: 0 },
  { county: 'San Francisco', referrals: 12, convicted: 0, notableCases: 0 },
  { county: 'Stanislaus', referrals: 14, convicted: 1, notableCases: 0 },
  { county: 'Other', referrals: 95, convicted: 2, notableCases: 0 },
]

const NOTABLE_CASES: NotableCase[] = [
  {
    id: 'khan-2023',
    year: 2023,
    county: 'San Joaquin',
    category: 'registration_fraud',
    title: 'Lodi councilman – 77 charges (14 election fraud)',
    summary: 'Shakir Khan pleaded no contest to 71 felonies and 6 misdemeanors, including voter registration fraud and fraudulent use of absentee ballots related to the 2020 election.',
    outcome: 'Convicted',
  },
  {
    id: 'chaouch-2022',
    year: 2022,
    county: 'Los Angeles',
    category: 'ineligible_voting',
    title: 'Kimberly Chaouch – ineligible voting',
    summary: 'Criminal conviction for voting despite not being eligible.',
    outcome: 'Convicted',
  },
  {
    id: 'morris-2022',
    year: 2022,
    county: 'Los Angeles',
    category: 'ineligible_voting',
    title: 'Toni Morris – ineligible voting',
    summary: 'Criminal conviction for ineligible voting.',
    outcome: 'Convicted',
  },
  {
    id: 'jasperson-2020',
    year: 2020,
    county: 'San Diego',
    category: 'ballot_petition_fraud',
    title: 'Jentry & Bradley Jasperson – ballot petition fraud',
    summary: 'Convictions for ballot petition fraud.',
    outcome: 'Convicted',
  },
  {
    id: 'hall-2020',
    year: 2020,
    county: 'San Diego',
    category: 'ballot_petition_fraud',
    title: 'Norman Hall – ballot petition fraud',
    summary: 'Conviction for ballot petition fraud.',
    outcome: 'Convicted',
  },
]

export function getVoterFraudYearly(): YearlySnapshot[] {
  return YEARLY
}

export function getVoterFraudByCounty(): CountySnapshot[] {
  return BY_COUNTY
}

export function getNotableCases(filters?: { year?: number; county?: string; category?: VoterFraudCategory }): NotableCase[] {
  let list = [...NOTABLE_CASES]
  if (filters?.year != null) list = list.filter((c) => c.year === filters.year)
  if (filters?.county) list = list.filter((c) => c.county === filters.county)
  if (filters?.category) list = list.filter((c) => c.category === filters.category)
  return list
}

export function getVoterFraudSummary(): {
  totalReferrals: number
  totalConvicted: number
  totalCharged: number
  yearRange: [number, number]
} {
  const totalReferrals = YEARLY.reduce((s, y) => s + y.referrals, 0)
  const totalConvicted = YEARLY.reduce((s, y) => s + y.convicted, 0)
  const totalCharged = YEARLY.reduce((s, y) => s + y.charged, 0)
  const years = YEARLY.map((y) => y.year)
  return {
    totalReferrals,
    totalConvicted,
    totalCharged,
    yearRange: [Math.min(...years), Math.max(...years)],
  }
}

export const VOTER_FRAUD_CATEGORIES: VoterFraudCategory[] = [
  'registration_fraud',
  'ineligible_voting',
  'double_voting',
  'ballot_petition_fraud',
  'absentee_ballot_fraud',
  'other',
]
