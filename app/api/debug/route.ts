import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
  
  let dbStatus = 'unknown'
  let caseCount = 0
  let errorMessage = ''
  
  try {
    const prisma = new PrismaClient()
    caseCount = await prisma.fraudCase.count()
    dbStatus = 'connected'
    await prisma.$disconnect()
  } catch (error) {
    dbStatus = 'error'
    errorMessage = error instanceof Error ? error.message : String(error)
  }
  
  return NextResponse.json({
    database_url_set: dbUrl !== 'NOT SET',
    masked_url: maskedUrl,
    database_status: dbStatus,
    case_count: caseCount,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  })
}
