import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const where: Prisma.FraudCaseWhereInput = {}
    if (schemeType) where.schemeType = schemeType
    if (startDate) where.dateFiled = { gte: new Date(startDate) }
    if (endDate) {
      where.dateFiled = {
        ...(where.dateFiled as object),
        lte: new Date(endDate),
      }
    }

    const heatmapData = await prisma.fraudCase.groupBy({
      by: ['county'],
      where,
      _count: true,
      _sum: {
        amountExposed: true,
      },
    })

    // Get representative coordinates for each county
    const countyCoords = await prisma.fraudCase.findMany({
      where: {
        county: { in: heatmapData.map((h) => h.county) },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        county: true,
        latitude: true,
        longitude: true,
      },
      distinct: ['county'],
    })

    const coordsMap = new Map(countyCoords.map((c) => [c.county, c]))

    return NextResponse.json(
      heatmapData.map((h) => {
        const coords = coordsMap.get(h.county)
        return {
          county: h.county,
          case_count: h._count,
          total_exposed: Number(h._sum.amountExposed || 0),
          latitude: coords?.latitude ? Number(coords.latitude) : null,
          longitude: coords?.longitude ? Number(coords.longitude) : null,
        }
      })
    )
  } catch (error) {
    console.error('Heatmap API error:', error)
    return NextResponse.json([])
  }
}
