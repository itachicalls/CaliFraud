import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Enforcement lag: time from date_filed (investigation/enforcement start)
 * to date_resolved. Uses date_filed as proxy for "case opened" when
 * date_alleged is not available.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupBy = searchParams.get('group_by') || 'county' // county | agency | program (schemeType)
    const schemeType = searchParams.get('scheme_type')
    const county = searchParams.get('county')

    const where: Prisma.FraudCaseWhereInput = {
      dateFiled: { not: null },
      dateResolved: { not: null },
    }
    if (schemeType) where.schemeType = schemeType
    if (county) where.county = county

    const cases = await prisma.fraudCase.findMany({
      where,
      select: {
        dateFiled: true,
        dateResolved: true,
        county: true,
        schemeType: true,
        enforcingAgency: true,
      },
    })

    const groupKey = groupBy === 'agency' ? 'enforcingAgency' : groupBy === 'program' ? 'schemeType' : 'county'

    const buckets: Record<string, number[]> = {}
    for (const c of cases) {
      const key = (c as Record<string, unknown>)[groupKey] as string || 'Unknown'
      const filed = c.dateFiled!.getTime()
      const resolved = c.dateResolved!.getTime()
      const days = Math.round((resolved - filed) / (1000 * 60 * 60 * 24))
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(days)
    }

    const results = Object.entries(buckets).map(([name, days]) => {
      days.sort((a, b) => a - b)
      const median = days[Math.floor(days.length / 2)] ?? 0
      const avg = days.reduce((s, d) => s + d, 0) / days.length
      return {
        name,
        case_count: days.length,
        median_days: median,
        avg_days: Math.round(avg),
        min_days: Math.min(...days),
        max_days: Math.max(...days),
      }
    })

    results.sort((a, b) => b.case_count - a.case_count)

    return NextResponse.json({ group_by: groupBy, results })
  } catch (error) {
    console.error('Enforcement lag API error:', error)
    return NextResponse.json({ group_by: 'county', results: [] })
  }
}
