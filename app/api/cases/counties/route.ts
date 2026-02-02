import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const counties = await prisma.fraudCase.findMany({
      select: { county: true },
      distinct: ['county'],
      orderBy: { county: 'asc' },
    })

    return NextResponse.json(counties.map((c) => c.county))
  } catch (error) {
    console.error('Counties API error:', error)
    return NextResponse.json([])
  }
}
