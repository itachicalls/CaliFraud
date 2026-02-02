import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const county = searchParams.get('county')

    // Build raw SQL for monthly grouping
    const whereConditions: string[] = ['date_filed IS NOT NULL']
    const params: string[] = []
    
    if (schemeType) {
      params.push(schemeType)
      whereConditions.push(`scheme_type = $${params.length}`)
    }
    if (county) {
      params.push(county)
      whereConditions.push(`county = $${params.length}`)
    }

    const whereClause = whereConditions.join(' AND ')

    const timeline = await prisma.$queryRawUnsafe<
      Array<{
        year: number
        month: number
        case_count: bigint
        total_exposed: number
      }>
    >(
      `SELECT 
        EXTRACT(YEAR FROM date_filed)::int as year,
        EXTRACT(MONTH FROM date_filed)::int as month,
        COUNT(*)::bigint as case_count,
        COALESCE(SUM(amount_exposed), 0)::float as total_exposed
      FROM fraud_cases
      WHERE ${whereClause}
      GROUP BY year, month
      ORDER BY year, month`,
      ...params
    )

    return NextResponse.json(
      timeline.map((t) => ({
        year: t.year,
        month: t.month,
        period: `${t.year}-${String(t.month).padStart(2, '0')}`,
        case_count: Number(t.case_count),
        total_exposed: t.total_exposed,
      }))
    )
  } catch (error) {
    console.error('Timeline API error:', error)
    return NextResponse.json([])
  }
}
