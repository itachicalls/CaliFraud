import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Accountability Tracker: cases with entity names, amounts, still-operating status.
 * For public records transparency.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stillOperating = searchParams.get('still_operating') // 'true' | 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 2000)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Prisma.FraudCaseWhereInput = {}
    if (stillOperating === 'true') (where as Record<string, unknown>).stillOperating = true

    // Base select - columns that always exist in fraud_cases
    const baseSelect = {
      id: true,
      caseNumber: true,
      title: true,
      schemeType: true,
      amountExposed: true,
      amountRecovered: true,
      dateFiled: true,
      county: true,
      city: true,
      status: true,
      sourceUrl: true,
    }

    let cases: Record<string, unknown>[]

    try {
      cases = await prisma.fraudCase.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { amountExposed: 'desc' },
        select: {
          ...baseSelect,
          entityNames: true,
          stillOperating: true,
          stillOperatingSource: true,
        },
      })
    } catch {
      // Fallback when new columns don't exist yet (run db:push)
      cases = await prisma.fraudCase.findMany({
        where: {},
        take: limit,
        skip: offset,
        orderBy: { amountExposed: 'desc' },
        select: baseSelect,
      })
    }

    let total: number
    try {
      total = await prisma.fraudCase.count(where)
    } catch {
      total = await prisma.fraudCase.count()
    }

    const rows = cases.map((c) => {
      const entityNames = (c as { entityNames?: string[] | null }).entityNames
      const names = Array.isArray(entityNames) ? entityNames : []
      return {
        id: c.id,
        case_number: c.caseNumber,
        title: c.title,
        scheme_type: c.schemeType,
        amount_exposed: c.amountExposed ? Number(c.amountExposed) : null,
        amount_recovered: c.amountRecovered ? Number(c.amountRecovered) : null,
        date_filed: c.dateFiled?.toISOString().split('T')[0] ?? null,
        county: c.county,
        city: c.city,
        status: c.status,
        source_url: c.sourceUrl,
        entity_names: names,
        still_operating: (c as { stillOperating?: boolean }).stillOperating ?? false,
        still_operating_source: (c as { stillOperatingSource?: string | null }).stillOperatingSource ?? null,
      }
    })

    return NextResponse.json({ total, rows, limit, offset })
  } catch (error) {
    console.error('Accountability API error:', error)
    return NextResponse.json({ total: 0, rows: [], limit: 500, offset: 0 })
  }
}
