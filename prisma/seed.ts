/**
 * CALIFORNIA FRAUD DATABASE - REAL DATA SEED
 * Uses documented fraud cases from DOJ, OAG, USAO, county DAs.
 */

import { PrismaClient } from '@prisma/client'
import { getTypology } from '../lib/typology'
import { getRealFraudCases } from '../lib/real-fraud-cases'

const prisma = new PrismaClient()

async function main() {
  console.log('============================================================')
  console.log('CALIFRAUD DATABASE - REAL DATA SEED')
  console.log('============================================================')

  const existingCount = await prisma.fraudCase.count()
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} cases. Clearing...`)
    await prisma.caseEntity.deleteMany()
    await prisma.entity.deleteMany()
    await prisma.fraudCase.deleteMany()
  }

  const realCases = getRealFraudCases()
  console.log(`\nInserting ${realCases.length} REAL fraud cases...`)

  for (const c of realCases) {
    await prisma.fraudCase.create({
      data: {
        caseNumber: c.caseNumber,
        title: c.title,
        description: c.description,
        schemeType: c.schemeType,
        typology: getTypology(c.schemeType),
        amountExposed: c.amountExposed,
        amountRecovered: c.amountRecovered ?? 0,
        dateFiled: new Date(c.dateFiled),
        dateResolved: c.dateResolved ? new Date(c.dateResolved) : null,
        enforcingAgency: c.caseNumber.startsWith('DOJ') ? 'DOJ' : c.caseNumber.startsWith('OAG') ? 'OAG' : c.caseNumber.startsWith('USAO') ? 'USAO' : 'DA',
        status: c.status,
        county: c.county,
        city: c.city,
        latitude: c.latitude,
        longitude: c.longitude,
        sourceUrl: c.sourceUrl,
        stillOperating: c.status === 'open' || c.status === 'under_investigation',
        entityNames: c.entityNames ?? [],
      },
    })
  }

  console.log('\n============================================================')
  console.log('SEED COMPLETE - ALL REAL DATA')
  console.log('============================================================')

  const total = await prisma.fraudCase.count()
  const totalExposed = await prisma.fraudCase.aggregate({ _sum: { amountExposed: true } })
  console.log(`\nTotal cases: ${total}`)
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
