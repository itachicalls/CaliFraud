import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const county = searchParams.get('county')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const where: Prisma.FraudCaseWhereInput = {}
    if (schemeType) where.schemeType = schemeType
    if (county) where.county = county
    if (startDate) where.dateFiled = { gte: new Date(startDate) }
    if (endDate) {
      where.dateFiled = {
        ...(where.dateFiled as object),
        lte: new Date(endDate),
      }
    }

    const [aggregates, schemeBreakdown] = await Promise.all([
      prisma.fraudCase.aggregate({
        where,
        _count: true,
        _sum: {
          amountExposed: true,
          amountRecovered: true,
        },
        _avg: {
          amountExposed: true,
        },
      }),
      prisma.fraudCase.groupBy({
        by: ['schemeType'],
        where,
        _count: true,
        _sum: {
          amountExposed: true,
        },
        orderBy: {
          _sum: {
            amountExposed: 'desc',
          },
        },
      }),
    ])

    const totalExposed = Number(aggregates._sum.amountExposed || 0)
    const totalRecovered = Number(aggregates._sum.amountRecovered || 0)

    return NextResponse.json({
      total_cases: aggregates._count,
      total_exposed: totalExposed,
      total_recovered: totalRecovered,
      average_amount: Number(aggregates._avg.amountExposed || 0),
      recovery_rate: totalExposed > 0 ? totalRecovered / totalExposed : 0,
      scheme_breakdown: schemeBreakdown.map((s) => ({
        scheme_type: s.schemeType,
        count: s._count,
        amount: Number(s._sum.amountExposed || 0),
      })),
    })
  } catch (error) {
    console.error('Summary API error:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
}
