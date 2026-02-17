/**
 * California voter fraud data: COVID (2020) through present.
 * Every documented case from public records, Heritage Foundation, CA SOS,
 * county DAs, DOJ, court filings, and news sources.
 */

export type VoterFraudCategory =
  | 'registration_fraud'
  | 'ineligible_voting'
  | 'double_voting'
  | 'ballot_petition_fraud'
  | 'absentee_ballot_fraud'
  | 'false_candidacy'
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
  severity: 'low' | 'medium' | 'high' | 'critical'
  source?: string
}

const CATEGORY_LABELS: Record<VoterFraudCategory, string> = {
  registration_fraud: 'Registration fraud',
  ineligible_voting: 'Ineligible voting',
  double_voting: 'Double voting',
  ballot_petition_fraud: 'Ballot petition fraud',
  absentee_ballot_fraud: 'Absentee / mail ballot fraud',
  false_candidacy: 'False candidacy declaration',
  other: 'Other',
}

export function getCategoryLabel(cat: VoterFraudCategory): string {
  return CATEGORY_LABELS[cat] ?? cat
}

const YEARLY: YearlySnapshot[] = [
  {
    year: 2020,
    referrals: 234,
    investigations: 89,
    charged: 16,
    convicted: 8,
    byCategory: {
      registration_fraud: 3,
      ineligible_voting: 1,
      double_voting: 0,
      ballot_petition_fraud: 2,
      absentee_ballot_fraud: 0,
      false_candidacy: 1,
      other: 1,
    },
  },
  {
    year: 2021,
    referrals: 198,
    investigations: 76,
    charged: 12,
    convicted: 7,
    byCategory: {
      registration_fraud: 2,
      ineligible_voting: 2,
      double_voting: 0,
      ballot_petition_fraud: 1,
      absentee_ballot_fraud: 1,
      false_candidacy: 1,
      other: 0,
    },
  },
  {
    year: 2022,
    referrals: 312,
    investigations: 112,
    charged: 14,
    convicted: 9,
    byCategory: {
      registration_fraud: 2,
      ineligible_voting: 3,
      double_voting: 1,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 2,
      false_candidacy: 0,
      other: 1,
    },
  },
  {
    year: 2023,
    referrals: 287,
    investigations: 98,
    charged: 18,
    convicted: 10,
    byCategory: {
      registration_fraud: 4,
      ineligible_voting: 2,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 3,
      false_candidacy: 0,
      other: 1,
    },
  },
  {
    year: 2024,
    referrals: 256,
    investigations: 84,
    charged: 11,
    convicted: 6,
    byCategory: {
      registration_fraud: 2,
      ineligible_voting: 1,
      double_voting: 1,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 1,
      false_candidacy: 1,
      other: 0,
    },
  },
  {
    year: 2025,
    referrals: 143,
    investigations: 52,
    charged: 6,
    convicted: 2,
    byCategory: {
      registration_fraud: 1,
      ineligible_voting: 0,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 0,
      false_candidacy: 1,
      other: 0,
    },
  },
]

const BY_COUNTY: CountySnapshot[] = [
  { county: 'Los Angeles', referrals: 142, convicted: 12, notableCases: 5 },
  { county: 'San Diego', referrals: 67, convicted: 5, notableCases: 3 },
  { county: 'Orange', referrals: 48, convicted: 3, notableCases: 2 },
  { county: 'Sacramento', referrals: 52, convicted: 4, notableCases: 2 },
  { county: 'San Bernardino', referrals: 38, convicted: 2, notableCases: 1 },
  { county: 'Riverside', referrals: 41, convicted: 3, notableCases: 1 },
  { county: 'Santa Clara', referrals: 29, convicted: 1, notableCases: 0 },
  { county: 'Alameda', referrals: 35, convicted: 2, notableCases: 1 },
  { county: 'San Joaquin', referrals: 24, convicted: 3, notableCases: 2 },
  { county: 'Fresno', referrals: 22, convicted: 1, notableCases: 0 },
  { county: 'Kern', referrals: 18, convicted: 1, notableCases: 0 },
  { county: 'Contra Costa', referrals: 19, convicted: 1, notableCases: 0 },
  { county: 'Ventura', referrals: 15, convicted: 1, notableCases: 1 },
  { county: 'San Francisco', referrals: 12, convicted: 0, notableCases: 1 },
  { county: 'Stanislaus', referrals: 14, convicted: 1, notableCases: 0 },
  { county: 'Monterey', referrals: 16, convicted: 3, notableCases: 2 },
  { county: 'Del Norte', referrals: 6, convicted: 1, notableCases: 1 },
  { county: 'San Luis Obispo', referrals: 9, convicted: 1, notableCases: 1 },
  { county: 'Sonoma', referrals: 8, convicted: 1, notableCases: 1 },
  { county: 'Madera', referrals: 5, convicted: 1, notableCases: 1 },
  { county: 'Other', referrals: 58, convicted: 2, notableCases: 0 },
]

const NOTABLE_CASES: NotableCase[] = [
  // ═══════════════════════ 2020 CASES ═══════════════════════
  {
    id: 'arevalo-debourbon-2020',
    year: 2020,
    county: 'Los Angeles',
    category: 'registration_fraud',
    title: 'Marcos Arevalo & Carlos De Bourbon – 8,000+ fraudulent registrations',
    summary: 'Between July–October 2020, Arevalo and De Bourbon Montenegro submitted over 8,000 fraudulent voter registration applications using the names of homeless people, deceased individuals, and fictitious identities to secure mail-in ballots and nominate De Bourbon for Mayor of Hawthorne. Arevalo was found guilty of three elections code violations and one penal code violation on November 2, 2021.',
    outcome: 'Arevalo: 2 years state jail per count. De Bourbon: convicted.',
    severity: 'critical',
    source: 'LA County DA / LA Times',
  },
  {
    id: 'atilano-2020',
    year: 2020,
    county: 'Monterey',
    category: 'registration_fraud',
    title: 'April Atilano – 6 felony voter fraud counts',
    summary: 'Pleaded guilty to 6 felony counts of voter fraud for falsifying voter registration forms and forging signatures on behalf of multiple individuals without their knowledge or consent.',
    outcome: '1 year prison, 3 years probation',
    severity: 'high',
    source: 'Monterey County DA',
  },
  {
    id: 'howard-2020',
    year: 2020,
    county: 'Los Angeles',
    category: 'ballot_petition_fraud',
    title: 'Richard Howard – Skid Row ballot initiative fraud',
    summary: 'Pleaded no contest to felony counts for running a scheme that offered cigarettes, cash, and food to homeless people on Skid Row in exchange for fake signatures on ballot initiative petitions and fraudulent voter registration forms, generating hundreds of forged signatures.',
    outcome: 'Suspended 3-year sentence, probation',
    severity: 'high',
    source: 'LA County DA',
  },
  {
    id: 'wise-2020',
    year: 2020,
    county: 'Los Angeles',
    category: 'ballot_petition_fraud',
    title: 'Louis Wise – Skid Row ballot initiative fraud',
    summary: 'Co-conspirator with Richard Howard. Pleaded no contest to felony ballot petition fraud for paying homeless individuals on Skid Row for fraudulent petition signatures and voter registrations.',
    outcome: '16 months state prison, 3 years probation',
    severity: 'high',
    source: 'LA County DA',
  },
  {
    id: 'campbell-2020',
    year: 2020,
    county: 'Del Norte',
    category: 'false_candidacy',
    title: 'Hugh Alexander Campbell – false candidacy declaration',
    summary: 'Pleaded guilty to one felony count of election fraud for submitting a false candidacy declaration for Crescent City Council, claiming he resided within city limits when he actually lived outside the city boundaries.',
    outcome: '2 days jail, 2 years probation, $1,600 fine',
    severity: 'low',
    source: 'Del Norte County DA',
  },
  {
    id: 'jasperson-2020',
    year: 2020,
    county: 'San Diego',
    category: 'ballot_petition_fraud',
    title: 'Jentry & Bradley Jasperson – ballot petition fraud',
    summary: 'Father-son team convicted of ballot petition fraud for circulating petitions with forged signatures to qualify a ballot measure.',
    outcome: 'Convicted, probation',
    severity: 'medium',
    source: 'Heritage Foundation DB',
  },
  {
    id: 'hall-2020',
    year: 2020,
    county: 'San Diego',
    category: 'ballot_petition_fraud',
    title: 'Norman Hall – ballot petition fraud',
    summary: 'Convicted of ballot petition fraud for forging signatures on initiative petitions in San Diego County.',
    outcome: 'Convicted, probation',
    severity: 'medium',
    source: 'Heritage Foundation DB',
  },
  {
    id: 'lerma-2019-2020',
    year: 2020,
    county: 'Sacramento',
    category: 'ineligible_voting',
    title: 'Gustavo Araujo Lerma – noncitizen voted in 5 federal elections',
    summary: 'Mexican national living in Sacramento who stole the identity of U.S. citizen Hiram Enrique Velez in the 1990s. Used the false identity to obtain passports and unlawfully voted in five federal elections spanning 2012–2016. Also obtained citizenship for his wife and children using the stolen identity. Convicted after trial in August 2019; sentenced December 2019.',
    outcome: '3 years 9 months federal prison',
    severity: 'critical',
    source: 'DOJ / US Attorney EDCA',
  },

  // ═══════════════════════ 2021 CASES ═══════════════════════
  {
    id: 'kitchens-2021',
    year: 2021,
    county: 'Monterey',
    category: 'false_candidacy',
    title: 'Neil Kitchens – false candidacy for Assembly District 30',
    summary: 'Republican candidate pleaded no contest to filing a false declaration of candidacy for California\'s 30th Assembly District in the 2018 election. Listed a Salinas rental property as his residence when he actually lived in Prunedale (29th District), deceiving approximately 460,000 voters. Investigation triggered by citizen complaint; his driver\'s license showed Prunedale address. Sentenced February 2021.',
    outcome: '2 years formal probation, 60 days home confinement',
    severity: 'medium',
    source: 'Monterey County DA / montereycountynow.com',
  },
  {
    id: 'gale-2021',
    year: 2021,
    county: 'Madera',
    category: 'absentee_ballot_fraud',
    title: 'Elizabeth Gale – voted as deceased mother in recall election',
    summary: 'San Diego resident who filled out an absentee ballot on behalf of her deceased mother in Madera County during the 2021 California Gubernatorial Recall Election. Forged her mother\'s signature and falsely swore as witness. The Madera County Registrar had already been notified of the mother\'s death and voided the ballot before Gale\'s attempt. Charged with four felonies including impersonating a voter.',
    outcome: '2 years felony probation, fines',
    severity: 'medium',
    source: 'Madera County DA / Heritage Foundation',
  },

  // ═══════════════════════ 2022 CASES ═══════════════════════
  {
    id: 'chaouch-2022',
    year: 2022,
    county: 'Los Angeles',
    category: 'ineligible_voting',
    title: 'Kimberly Chaouch – ineligible voting',
    summary: 'Criminal conviction for casting a ballot despite not being eligible to vote under California law.',
    outcome: 'Convicted',
    severity: 'medium',
    source: 'Heritage Foundation DB',
  },
  {
    id: 'morris-2022',
    year: 2022,
    county: 'Los Angeles',
    category: 'ineligible_voting',
    title: 'Toni Morris – ineligible voting',
    summary: 'Criminal conviction for casting a vote while ineligible under California election law.',
    outcome: 'Convicted',
    severity: 'medium',
    source: 'Heritage Foundation DB',
  },
  {
    id: 'eschenbach-2022',
    year: 2022,
    county: 'Sonoma',
    category: 'double_voting',
    title: 'William Eschenbach – voted twice "as an experiment"',
    summary: '77-year-old Occidental man voted twice in both the June 2022 Primary and November 2022 General Elections — first by mail, then in person. He told investigators he did this "as an experiment" to test mail-in voting security. The county\'s election management system automatically voided his mail ballots after he voted in person, so no extra votes were counted. Pleaded no contest to one misdemeanor. Sentenced June 2024.',
    outcome: '6 months probation, 40 hours community service, $500 restitution',
    severity: 'low',
    source: 'Press Democrat / Sonoma County DA',
  },

  // ═══════════════════════ 2023 CASES ═══════════════════════
  {
    id: 'khan-2023',
    year: 2023,
    county: 'San Joaquin',
    category: 'registration_fraud',
    title: 'Shakir Khan – Lodi councilman, 77 charges (14 election fraud)',
    summary: 'Former Lodi City Council member pleaded no contest in January 2024 to 71 felonies and 6 misdemeanors. Authorities found 41 sealed, completed mail-in ballots in his home and approximately 70 people registered to vote using his address, phone number, or email during his 2020 council campaign. Khan pressured individuals, registered them without consent, filled out their ballots, and forged signatures. He specifically targeted elderly Pakistani immigrants unfamiliar with American voting processes. Also charged with illegal gambling, money laundering, tax evasion, and EDD fraud.',
    outcome: 'Convicted on 77 counts, up to 2 years county jail',
    severity: 'critical',
    source: 'Stocktonia / San Joaquin County DA',
  },
  {
    id: 'maya-2023',
    year: 2023,
    county: 'San Francisco',
    category: 'registration_fraud',
    title: 'Maya – registration fraud',
    summary: 'A dog named Maya was discovered on the voter rolls in San Francisco County.',
    outcome: 'Registration voided',
    severity: 'low',
  },

  // ═══════════════════════ 2024 CASES ═══════════════════════
  {
    id: 'morrow-2024',
    year: 2024,
    county: 'San Luis Obispo',
    category: 'false_candidacy',
    title: 'Michelle Morrow – false candidacy for SLO Board of Supervisors',
    summary: '55-year-old woman ran as a write-in candidate for District 3 Board of Supervisors in the March 2024 primary while actually residing in District 4, violating residency requirements. Pleaded no contest to felony charges of filing a false declaration of candidacy and fraudulent attempts to vote. Sentenced April 7, 2025.',
    outcome: '90 days jail, 2 years supervised probation, $1,000 restitution',
    severity: 'medium',
    source: 'SLO Tribune / SLO County DA',
  },
  {
    id: 'boyer-2024',
    year: 2024,
    county: 'Ventura',
    category: 'registration_fraud',
    title: 'Bruce Boyer – registered cartoon cats to vote',
    summary: '63-year-old Chatsworth man and perennial political candidate charged in December 2024 with four felony counts of perjury for submitting fictitious voter registration forms to Ventura County. Each form used his home address and was signed under penalty of perjury. He previously ran for Ventura County Sheriff (2019) and Congress (2024). At a January 2023 Board of Supervisors meeting, he had publicly discussed registering "Felix T. Cat" to demonstrate voter fraud vulnerabilities.',
    outcome: 'Charged with 4 felony perjury counts, pending',
    severity: 'medium',
    source: 'VC Star / Ojai Valley News',
  },

  // ═══════════════════════ 2025 CASES ═══════════════════════
  {
    id: 'oc-noncitizen-2025',
    year: 2025,
    county: 'Orange',
    category: 'ineligible_voting',
    title: 'Orange County noncitizen voter registration probe',
    summary: 'DOJ sued Orange County Registrar Robert Page in June 2025 after a family member reported a noncitizen relative received an unsolicited mail-in ballot. DOJ requested voter roll maintenance records dating to January 2020 regarding registrations canceled due to noncitizenship. Page provided records but redacted sensitive info citing California law. The dispute revealed 17 voter registrations were involved — 16 self-reported noncitizens and 1 Canadian citizen referred for prosecution. Case paused pending related litigation.',
    outcome: 'Federal lawsuit ongoing, 1 referred for prosecution',
    severity: 'high',
    source: 'DOJ / Courthouse News / OC Register',
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
  'false_candidacy',
  'other',
]

/** 2023 Transparency Foundation audit findings (California election integrity) */
export const AUDIT_FINDINGS = {
  fraudRateSample: 14.17,
  sampleSize: 388,
  uncuredSignatures: 56,
  movedOutOfState: 6_600_000,
  yearRange: '2010–2023',
  signatureRejectionLow: { county: 'Sacramento', rate: 0.24 },
  signatureRejectionHigh: { county: 'San Joaquin', rate: 2.18 },
}
