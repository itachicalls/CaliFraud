import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
import { SCHEME_TO_TYPOLOGY } from '@/lib/typology'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const typology = searchParams.get('typology')
    const county = searchParams.get('county')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')
    const stillOperating = searchParams.get('still_operating')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Prisma.FraudCaseWhereInput = {}

    if (schemeType) where.schemeType = schemeType
    if (typology) {
      const schemeTypes = Object.entries(SCHEME_TO_TYPOLOGY)
        .filter(([, t]) => t === typology)
        .map(([s]) => s)
      if (schemeTypes.length > 0) {
        where.schemeType = { in: schemeTypes }
      } else {
        where.typology = typology
      }
    }
    if (county) where.county = county
    if (stillOperating === 'true') where.stillOperating = true
    if (status) where.status = status
    if (minAmount) where.amountExposed = { gte: parseFloat(minAmount) }
    if (maxAmount) {
      where.amountExposed = {
        ...(where.amountExposed as object),
        lte: parseFloat(maxAmount),
      }
    }
    if (startDate) where.dateFiled = { gte: new Date(startDate) }
    if (endDate) {
      where.dateFiled = {
        ...(where.dateFiled as object),
        lte: new Date(endDate),
      }
    }

    const [cases, total] = await Promise.all([
      prisma.fraudCase.findMany({
        where,
        take: Math.min(limit, 1000),
        skip: offset,
        orderBy: { dateFiled: 'desc' },
      }),
      prisma.fraudCase.count({ where }),
    ])

    return NextResponse.json({
      total,
      cases: cases.map((c) => ({
        id: c.id,
        case_number: c.caseNumber,
        title: c.title,
        description: c.description,
        scheme_type: c.schemeType,
        amount_exposed: c.amountExposed ? Number(c.amountExposed) : null,
        amount_recovered: c.amountRecovered ? Number(c.amountRecovered) : null,
        date_filed: c.dateFiled?.toISOString().split('T')[0] || null,
        date_resolved: c.dateResolved?.toISOString().split('T')[0] || null,
        status: c.status,
        county: c.county,
        city: c.city,
        latitude: c.latitude ? Number(c.latitude) : null,
        longitude: c.longitude ? Number(c.longitude) : null,
        source_url: c.sourceUrl,
        typology: (c as { typology?: string | null }).typology ?? null,
        still_operating: (c as { stillOperating?: boolean }).stillOperating ?? false,
        still_operating_source: (c as { stillOperatingSource?: string | null }).stillOperatingSource ?? null,
        entity_names: (c as { entityNames?: unknown }).entityNames ?? null,
        created_at: c.createdAt.toISOString(),
      })),
      limit,
      offset,
    })
  } catch (error) {
    console.error('Cases API error:', error)
    return NextResponse.json({ total: 0, cases: [], limit: 100, offset: 0 })
  }
}
