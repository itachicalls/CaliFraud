import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getFallbackRiskIndex } from '@/lib/fallback-data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Fraud Risk Index (0-100) per county.
 * Formula: case_density (40) + dollar_exposure (30) + recidivism (20) + enforcement_delay (10)
 * All components normalized to 0-100 within dataset.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const by = searchParams.get('by') || 'county' // county | program (schemeType)

    const where: Prisma.FraudCaseWhereInput = {}
    const schemeType = searchParams.get('scheme_type')
    const county = searchParams.get('county')
    if (schemeType) where.schemeType = schemeType
    if (county) where.county = county

    const groupKey = by === 'program' ? 'schemeType' : 'county'

    const cases = await prisma.fraudCase.findMany({
      where,
      select: {
        county: true,
        schemeType: true,
        amountExposed: true,
        dateFiled: true,
        dateResolved: true,
        caseEntities: { select: { id: true } },
      },
    })

    const buckets: Record<
      string,
      { count: number; totalExposed: number; resolutionDays: number[]; entityCaseCount: number }
    > = {}

    for (const c of cases) {
      const key = (c as Record<string, unknown>)[groupKey] as string || 'Unknown'
      if (!buckets[key]) {
        buckets[key] = { count: 0, totalExposed: 0, resolutionDays: [], entityCaseCount: 0 }
      }
      buckets[key].count += 1
      buckets[key].totalExposed += Number(c.amountExposed || 0)
      if (c.dateFiled && c.dateResolved) {
        const days = (c.dateResolved.getTime() - c.dateFiled.getTime()) / (1000 * 60 * 60 * 24)
        buckets[key].resolutionDays.push(days)
      }
      if (c.caseEntities && (c.caseEntities as unknown[]).length > 0) {
        buckets[key].entityCaseCount += 1
      }
    }

    const counts = Object.values(buckets).map((b) => b.count)
    const exposures = Object.values(buckets).map((b) => b.totalExposed)
    const recidivismRates = Object.values(buckets).map((b) =>
      b.count > 0 ? (b.entityCaseCount / b.count) * 100 : 0
    )
    const medians = Object.values(buckets).map((b) => {
      if (b.resolutionDays.length === 0) return 0
      const sorted = [...b.resolutionDays].sort((a, b) => a - b)
      return sorted[Math.floor(sorted.length / 2)]
    })

    const maxCount = Math.max(...counts, 1)
    const maxExposure = Math.max(...exposures, 1)
    const maxRecidivism = Math.max(...recidivismRates, 1)
    const maxMedian = Math.max(...medians, 1)

    const results = Object.entries(buckets).map(([name, b]) => {
      const densityScore = (b.count / maxCount) * 100
      const exposureScore = (b.totalExposed / maxExposure) * 100
      const recidivismScore = b.count > 0 ? (b.entityCaseCount / b.count / (maxRecidivism / 100)) * 100 : 0
      const medianDays = b.resolutionDays.length
        ? b.resolutionDays.sort((a, b) => a - b)[Math.floor(b.resolutionDays.length / 2)]
        : 0
      const delayScore = (medianDays / maxMedian) * 100

      const riskIndex = Math.round(
        densityScore * 0.4 + exposureScore * 0.3 + Math.min(recidivismScore, 100) * 0.2 + Math.min(delayScore, 100) * 0.1
      )

      return {
        name,
        case_count: b.count,
        total_exposed: b.totalExposed,
        median_resolution_days: Math.round(medianDays),
        entity_linked_cases: b.entityCaseCount,
        risk_index: Math.min(100, Math.max(0, riskIndex)),
      }
    })

    results.sort((a, b) => b.risk_index - a.risk_index)

    return NextResponse.json({ by, results })
  } catch (error) {
    console.error('Risk index API error:', error)
    try {
      const { searchParams } = new URL(request.url)
      const results = getFallbackRiskIndex({
        by: searchParams.get('by') ?? undefined,
        scheme_type: searchParams.get('scheme_type') ?? undefined,
        county: searchParams.get('county') ?? undefined,
      })
      return NextResponse.json({ by: searchParams.get('by') || 'county', results })
    } catch {
      return NextResponse.json({ by: 'county', results: [] })
    }
  }
}
