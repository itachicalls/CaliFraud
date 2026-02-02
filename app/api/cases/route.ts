import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const county = searchParams.get('county')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Prisma.FraudCaseWhereInput = {}

    if (schemeType) where.schemeType = schemeType
    if (county) where.county = county
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
        created_at: c.createdAt.toISOString(),
      })),
      limit,
      offset,
    })
  } catch (error) {
    console.error('Cases API error:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}
