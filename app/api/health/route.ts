import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const count = await prisma.fraudCase.count()
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      cases: count,
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      cases: 0,
    })
  }
}
