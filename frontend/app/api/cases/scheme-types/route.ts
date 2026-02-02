import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const schemeTypes = await prisma.fraudCase.findMany({
      select: { schemeType: true },
      distinct: ['schemeType'],
      orderBy: { schemeType: 'asc' },
    })

    return NextResponse.json(schemeTypes.map((s) => s.schemeType))
  } catch (error) {
    console.error('Scheme types API error:', error)
    return NextResponse.json({ error: 'Failed to fetch scheme types' }, { status: 500 })
  }
}
