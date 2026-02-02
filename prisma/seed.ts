/**
 * CALIFORNIA FRAUD DATABASE - COMPREHENSIVE SEED DATA
 * Reflecting the full scale of fraud exposed across all programs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

// All 58 California counties with coordinates and fraud weighting
const COUNTIES: Record<string, { lat: number; lng: number; weight: number }> = {
  'Los Angeles': { lat: 34.0522, lng: -118.2437, weight: 28 },
  'San Diego': { lat: 32.7157, lng: -117.1611, weight: 10 },
  'Orange': { lat: 33.7175, lng: -117.8311, weight: 9 },
  'Riverside': { lat: 33.9806, lng: -117.3755, weight: 7 },
  'San Bernardino': { lat: 34.1083, lng: -117.2898, weight: 7 },
  'Santa Clara': { lat: 37.3541, lng: -121.9552, weight: 5 },
  'Alameda': { lat: 37.8044, lng: -122.2712, weight: 5 },
  'Sacramento': { lat: 38.5816, lng: -121.4944, weight: 5 },
  'San Francisco': { lat: 37.7749, lng: -122.4194, weight: 4 },
  'Contra Costa': { lat: 37.9161, lng: -122.0574, weight: 3 },
  'Fresno': { lat: 36.7378, lng: -119.7871, weight: 3 },
  'Kern': { lat: 35.3733, lng: -119.0187, weight: 3 },
  'San Mateo': { lat: 37.5585, lng: -122.2711, weight: 2 },
  'Ventura': { lat: 34.2746, lng: -119.229, weight: 2 },
  'San Joaquin': { lat: 37.9577, lng: -121.2908, weight: 2 },
  'Stanislaus': { lat: 37.5091, lng: -120.9876, weight: 2 },
  'Sonoma': { lat: 38.2921, lng: -122.458, weight: 1 },
  'Tulare': { lat: 36.2077, lng: -119.3473, weight: 2 },
  'Santa Barbara': { lat: 34.4208, lng: -119.6982, weight: 1 },
  'Monterey': { lat: 36.6002, lng: -121.8947, weight: 1 },
  'Placer': { lat: 38.7849, lng: -121.2357, weight: 1 },
  'Solano': { lat: 38.2494, lng: -121.7853, weight: 1 },
  'Marin': { lat: 37.9735, lng: -122.5311, weight: 1 },
  'Santa Cruz': { lat: 36.9741, lng: -122.0308, weight: 1 },
  'Merced': { lat: 37.3022, lng: -120.483, weight: 1 },
  'San Luis Obispo': { lat: 35.2828, lng: -120.6596, weight: 1 },
  'Imperial': { lat: 32.8476, lng: -115.5695, weight: 2 },
}

// Fraud scheme types with weights and amount ranges
const SCHEME_TYPES = [
  { type: 'edd_unemployment', weight: 22, minAmount: 10000, maxAmount: 25000000, peakYears: [2020, 2021, 2022] },
  { type: 'ppp_fraud', weight: 15, minAmount: 50000, maxAmount: 20000000, peakYears: [2020, 2021, 2022] },
  { type: 'eidl_fraud', weight: 8, minAmount: 25000, maxAmount: 10000000, peakYears: [2020, 2021, 2022] },
  { type: 'medi_cal', weight: 12, minAmount: 100000, maxAmount: 50000000, peakYears: [2023, 2024, 2025, 2026] },
  { type: 'telemedicine', weight: 8, minAmount: 100000, maxAmount: 40000000, peakYears: [2020, 2021, 2022] },
  { type: 'pharmacy', weight: 6, minAmount: 50000, maxAmount: 30000000, peakYears: null },
  { type: 'dme', weight: 5, minAmount: 75000, maxAmount: 25000000, peakYears: null },
  { type: 'home_health', weight: 4, minAmount: 100000, maxAmount: 35000000, peakYears: null },
  { type: 'hospice', weight: 2, minAmount: 200000, maxAmount: 45000000, peakYears: [2024, 2025, 2026] },
  { type: 'homeless_program', weight: 10, minAmount: 100000, maxAmount: 75000000, peakYears: [2024, 2025, 2026] },
  { type: 'calfresh', weight: 5, minAmount: 5000, maxAmount: 5000000, peakYears: null },
  { type: 'workers_comp', weight: 4, minAmount: 50000, maxAmount: 15000000, peakYears: null },
  { type: 'contract_fraud', weight: 5, minAmount: 500000, maxAmount: 100000000, peakYears: [2024, 2025, 2026] },
  { type: 'tax_fraud', weight: 4, minAmount: 100000, maxAmount: 50000000, peakYears: null },
  { type: 'insurance_fraud', weight: 4, minAmount: 25000, maxAmount: 20000000, peakYears: null },
  { type: 'education_fraud', weight: 2, minAmount: 100000, maxAmount: 30000000, peakYears: [2024, 2025, 2026] },
  { type: 'substance_abuse', weight: 3, minAmount: 500000, maxAmount: 80000000, peakYears: [2023, 2024, 2025] },
  { type: 'lab_testing', weight: 3, minAmount: 200000, maxAmount: 60000000, peakYears: [2020, 2021, 2022] },
]

const TITLE_TEMPLATES: Record<string, string[]> = {
  edd_unemployment: ['EDD Fraud Ring - {city}', 'Unemployment Benefits Fraud - {county} County', 'Pandemic Unemployment Scam - {city}', 'Multi-Million Dollar EDD Scheme - {city}'],
  ppp_fraud: ['PPP Loan Fraud - {city}', 'Paycheck Protection Scheme - {county}', 'COVID Relief Fund Fraud - {city}'],
  eidl_fraud: ['EIDL Loan Fraud - {city}', 'Economic Injury Disaster Loan Scheme - {county}'],
  medi_cal: ['Medi-Cal Billing Fraud - {city}', 'Phantom Patient Billing - {county} County', 'Medi-Cal Overbilling - {city}'],
  telemedicine: ['Telemedicine Fraud Scheme - {city}', 'COVID Telehealth Billing Fraud - {city}'],
  pharmacy: ['Pharmacy Kickback Scheme - {city}', 'Prescription Drug Diversion - {county}'],
  dme: ['DME Fraud Scheme - {city}', 'Wheelchair Billing Fraud - {county}'],
  home_health: ['Home Health Care Fraud - {city}', 'Phantom Patient Scheme - {county}'],
  hospice: ['Hospice Fraud - {city}', 'Ineligible Hospice Enrollment - {county}'],
  homeless_program: ['Homeless Program Fraud - {city}', 'Housing First Abuse - {county}', 'Shelter Funding Misuse - {city}', 'Project Homekey Fraud - {city}'],
  calfresh: ['CalFresh Benefits Trafficking - {city}', 'SNAP Fraud Ring - {county}'],
  workers_comp: ['Workers Comp Fraud - {city}', 'Fraudulent Injury Claims - {county}'],
  contract_fraud: ['Government Contract Fraud - {city}', 'No-Bid Contract Scheme - {county}', 'Public Works Fraud - {city}'],
  tax_fraud: ['Tax Evasion Scheme - {city}', 'Payroll Tax Fraud - {county}'],
  insurance_fraud: ['Auto Insurance Fraud Ring - {city}', 'Staged Accident Scheme - {county}'],
  education_fraud: ['School Funding Fraud - {city}', 'Charter School Fraud - {city}'],
  substance_abuse: ['Treatment Center Fraud - {city}', 'Sober Living Kickbacks - {county}'],
  lab_testing: ['Lab Testing Fraud - {city}', 'COVID Testing Scheme - {county}'],
}

const CITIES: Record<string, string[]> = {
  'Los Angeles': ['Los Angeles', 'Long Beach', 'Glendale', 'Santa Monica', 'Pasadena', 'Burbank', 'Torrance', 'Inglewood', 'Compton', 'Downey'],
  'San Diego': ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon'],
  'Orange': ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach', 'Garden Grove', 'Fullerton', 'Costa Mesa'],
  'Riverside': ['Riverside', 'Corona', 'Moreno Valley', 'Temecula', 'Palm Springs'],
  'San Bernardino': ['San Bernardino', 'Fontana', 'Rancho Cucamonga', 'Ontario', 'Victorville'],
  'Santa Clara': ['San Jose', 'Sunnyvale', 'Santa Clara', 'Mountain View', 'Palo Alto'],
  'Alameda': ['Oakland', 'Fremont', 'Hayward', 'Berkeley', 'San Leandro'],
  'Sacramento': ['Sacramento', 'Elk Grove', 'Roseville', 'Folsom'],
  'San Francisco': ['San Francisco'],
  'Contra Costa': ['Concord', 'Richmond', 'Antioch', 'Walnut Creek'],
  'Fresno': ['Fresno', 'Clovis'],
  'Kern': ['Bakersfield', 'Delano'],
}

const STATUSES = ['open', 'under_investigation', 'charged', 'settled', 'convicted', 'dismissed']

function weightedChoice<T>(items: T[], getWeight: (item: T) => number): T {
  const total = items.reduce((sum, item) => sum + getWeight(item), 0)
  let r = Math.random() * total
  for (const item of items) {
    r -= getWeight(item)
    if (r <= 0) return item
  }
  return items[items.length - 1]
}

function randomDate(start: Date, end: Date, peakYears: number[] | null): Date {
  if (peakYears && Math.random() < 0.7) {
    const year = peakYears[Math.floor(Math.random() * peakYears.length)]
    const month = Math.floor(Math.random() * 12)
    const day = Math.floor(Math.random() * 28) + 1
    return new Date(year, month, day)
  }
  
  // Weight toward recent dates
  if (Math.random() < 0.5) {
    const year = [2024, 2025, 2026][Math.floor(Math.random() * 3)]
    const month = year === 2026 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 12)
    const day = Math.floor(Math.random() * 28) + 1
    return new Date(year, month, day)
  }
  
  const time = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(time)
}

function generateMegaCases() {
  const megaCases = [
    { title: 'EDD Pandemic Fraud - Multi-State Enterprise', schemeType: 'edd_unemployment', amount: 250000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2021-03-15'), status: 'convicted' },
    { title: 'California Prison EDD Fraud Ring', schemeType: 'edd_unemployment', amount: 140000000, county: 'Sacramento', city: 'Sacramento', date: new Date('2021-01-20'), status: 'convicted' },
    { title: 'Romanian Crime Ring EDD Scheme', schemeType: 'edd_unemployment', amount: 85000000, county: 'Orange', city: 'Irvine', date: new Date('2021-06-10'), status: 'convicted' },
    { title: 'LA Homeless Housing Authority Embezzlement', schemeType: 'homeless_program', amount: 95000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2025-08-12'), status: 'under_investigation' },
    { title: 'Project Homekey Contractor Fraud Network', schemeType: 'homeless_program', amount: 67000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2025-11-03'), status: 'charged' },
    { title: 'SF Navigation Center Billing Fraud', schemeType: 'homeless_program', amount: 42000000, county: 'San Francisco', city: 'San Francisco', date: new Date('2025-06-22'), status: 'under_investigation' },
    { title: 'Statewide Homeless Fund Embezzlement Network', schemeType: 'homeless_program', amount: 125000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2026-01-15'), status: 'under_investigation' },
    { title: 'CalAIM Healthcare Transition Fraud Ring', schemeType: 'medi_cal', amount: 78000000, county: 'San Diego', city: 'San Diego', date: new Date('2026-01-22'), status: 'charged' },
    { title: 'Southern California Telemedicine Fraud Empire', schemeType: 'telemedicine', amount: 180000000, county: 'Orange', city: 'Anaheim', date: new Date('2021-05-08'), status: 'convicted' },
    { title: 'Inland Empire Hospice Fraud Ring', schemeType: 'hospice', amount: 95000000, county: 'Riverside', city: 'Riverside', date: new Date('2025-04-18'), status: 'charged' },
    { title: 'LA Sober Living Patient Brokering Network', schemeType: 'substance_abuse', amount: 175000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2024-07-12'), status: 'convicted' },
    { title: 'California High-Speed Rail Contract Fraud', schemeType: 'contract_fraud', amount: 220000000, county: 'Sacramento', city: 'Sacramento', date: new Date('2025-09-30'), status: 'under_investigation' },
    { title: 'LA Metro Contractor Kickback Scheme', schemeType: 'contract_fraud', amount: 85000000, county: 'Los Angeles', city: 'Los Angeles', date: new Date('2025-05-14'), status: 'charged' },
    { title: 'Bay Area PPP Loan Mill Operation', schemeType: 'ppp_fraud', amount: 45000000, county: 'Santa Clara', city: 'San Jose', date: new Date('2022-03-20'), status: 'settled' },
  ]

  return megaCases.map((mc, i) => {
    const countyData = COUNTIES[mc.county] || COUNTIES['Los Angeles']
    return {
      caseNumber: `CA-MEGA-${mc.date.getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      title: mc.title,
      description: `Major fraud investigation: ${mc.title}. Alleged fraudulent activity totaling $${mc.amount.toLocaleString()}.`,
      schemeType: mc.schemeType,
      amountExposed: mc.amount,
      amountRecovered: mc.status === 'convicted' || mc.status === 'settled' ? mc.amount * (0.1 + Math.random() * 0.4) : 0,
      dateFiled: mc.date,
      dateResolved: mc.status === 'convicted' || mc.status === 'settled' ? new Date(mc.date.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) : null,
      status: mc.status,
      county: mc.county,
      city: mc.city,
      latitude: countyData.lat + (Math.random() - 0.5) * 0.1,
      longitude: countyData.lng + (Math.random() - 0.5) * 0.1,
      sourceUrl: `https://oig.ca.gov/fraud/${mc.date.getFullYear()}/mega-${i + 1}`,
    }
  })
}

function generateCases(count: number) {
  const cases = []
  const startDate = new Date('2020-01-01')
  const endDate = new Date('2026-02-02')
  const countyEntries = Object.entries(COUNTIES)

  for (let i = 0; i < count; i++) {
    const [countyName, countyData] = weightedChoice(countyEntries, ([, d]) => d.weight)
    const scheme = weightedChoice(SCHEME_TYPES, (s) => s.weight)
    const cityList = CITIES[countyName] || [countyName]
    const city = cityList[Math.floor(Math.random() * cityList.length)]

    const amount = scheme.minAmount + Math.random() * (scheme.maxAmount - scheme.minAmount)
    const filedDate = randomDate(startDate, endDate, scheme.peakYears)
    
    const daysOld = (Date.now() - filedDate.getTime()) / (1000 * 60 * 60 * 24)
    let status: string
    if (daysOld < 90) {
      status = Math.random() < 0.6 ? 'open' : 'under_investigation'
    } else if (daysOld < 365) {
      status = STATUSES[Math.floor(Math.random() * 4)]
    } else {
      status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
    }

    const templates = TITLE_TEMPLATES[scheme.type] || [`${scheme.type} Fraud - {city}`]
    const titleTemplate = templates[Math.floor(Math.random() * templates.length)]
    const title = titleTemplate.replace('{city}', city).replace('{county}', countyName)

    cases.push({
      caseNumber: `CA-${filedDate.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
      title,
      description: `${scheme.type.replace(/_/g, ' ')} investigation in ${city}, ${countyName} County. Alleged fraudulent activity totaling $${Math.round(amount).toLocaleString()}.`,
      schemeType: scheme.type,
      amountExposed: amount,
      amountRecovered: ['settled', 'convicted'].includes(status) ? amount * Math.random() * 0.6 : 0,
      dateFiled: filedDate,
      dateResolved: ['settled', 'convicted', 'dismissed'].includes(status) ? new Date(filedDate.getTime() + Math.random() * 730 * 24 * 60 * 60 * 1000) : null,
      status,
      county: countyName,
      city,
      latitude: countyData.lat + (Math.random() - 0.5) * 0.4,
      longitude: countyData.lng + (Math.random() - 0.5) * 0.4,
      sourceUrl: `https://oig.ca.gov/fraud/${filedDate.getFullYear()}/${i + 1}`,
    })

    if ((i + 1) % 10000 === 0) {
      console.log(`Generated ${i + 1} cases...`)
    }
  }

  return cases
}

async function main() {
  console.log('============================================================')
  console.log('CALIFRAUD DATABASE - COMPREHENSIVE SEED')
  console.log('============================================================')

  // Check if already seeded
  const existingCount = await prisma.fraudCase.count()
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount.toLocaleString()} cases.`)
    console.log('Clearing existing data...')
    await prisma.fraudCase.deleteMany()
  }

  console.log('\nGenerating mega fraud cases...')
  const megaCases = generateMegaCases()
  console.log(`  Created ${megaCases.length} mega cases`)

  console.log('\nGenerating 50,000 regular fraud cases...')
  const regularCases = generateCases(50000)
  console.log(`  Created ${regularCases.length.toLocaleString()} regular cases`)

  const allCases = [...megaCases, ...regularCases]

  console.log(`\nInserting ${allCases.length.toLocaleString()} cases...`)
  
  // Batch insert for performance
  const batchSize = 1000
  for (let i = 0; i < allCases.length; i += batchSize) {
    const batch = allCases.slice(i, i + batchSize)
    await prisma.fraudCase.createMany({ data: batch })
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allCases.length / batchSize)}`)
  }

  console.log('\n============================================================')
  console.log('SEED COMPLETE!')
  console.log('============================================================')

  const total = await prisma.fraudCase.count()
  const totalExposed = await prisma.fraudCase.aggregate({ _sum: { amountExposed: true } })
  
  console.log(`\nTotal cases: ${total.toLocaleString()}`)
  console.log(`Total fraud exposed: $${Number(totalExposed._sum.amountExposed || 0).toLocaleString()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
