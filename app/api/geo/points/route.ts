import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
import { SCHEME_TO_TYPOLOGY } from '@/lib/typology'
import { getFallbackGeoPoints } from '@/lib/fallback-data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const schemeType = searchParams.get('scheme_type')
    const typology = searchParams.get('typology')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')

    const where: Prisma.FraudCaseWhereInput = {
      latitude: { not: null },
      longitude: { not: null },
    }

    if (schemeType) where.schemeType = schemeType
    if (typology) {
      const schemeTypes = Object.entries(SCHEME_TO_TYPOLOGY)
        .filter(([, t]) => t === typology)
        .map(([s]) => s)
      if (schemeTypes.length > 0) where.schemeType = { in: schemeTypes }
    }
    if (startDate) where.dateFiled = { gte: new Date(startDate) }
    if (endDate) {
      where.dateFiled = {
        ...(where.dateFiled as object),
        lte: new Date(endDate),
      }
    }
    if (minAmount) where.amountExposed = { gte: parseFloat(minAmount) }
    if (maxAmount) {
      where.amountExposed = {
        ...(where.amountExposed as object),
        lte: parseFloat(maxAmount),
      }
    }

    const cases = await prisma.fraudCase.findMany({
      where,
      select: {
        id: true,
        caseNumber: true,
        title: true,
        schemeType: true,
        amountExposed: true,
        dateFiled: true,
        status: true,
        county: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    })

    const geojson = {
      type: 'FeatureCollection' as const,
      features: cases.map((c) => ({
        type: 'Feature' as const,
        properties: {
          id: c.id,
          case_number: c.caseNumber,
          title: c.title,
          scheme_type: c.schemeType,
          amount_exposed: c.amountExposed ? Number(c.amountExposed) : null,
          date_filed: c.dateFiled?.toISOString().split('T')[0] || null,
          status: c.status,
          county: c.county,
          city: c.city,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [Number(c.longitude), Number(c.latitude)],
        },
      })),
    }

    return NextResponse.json(geojson)
  } catch (error) {
    console.error('Geo points API error:', error)
    try {
      const { searchParams } = new URL(request.url)
      return NextResponse.json(
        getFallbackGeoPoints({
          scheme_type: searchParams.get('scheme_type') ?? undefined,
          typology: searchParams.get('typology') ?? undefined,
          start_date: searchParams.get('start_date') ?? undefined,
          end_date: searchParams.get('end_date') ?? undefined,
          min_amount: searchParams.get('min_amount') ?? undefined,
          max_amount: searchParams.get('max_amount') ?? undefined,
        })
      )
    } catch {
      return NextResponse.json({ type: 'FeatureCollection', features: [] })
    }
  }
}
