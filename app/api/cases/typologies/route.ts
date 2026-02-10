import { NextResponse } from 'next/server'
import { TYPOLOGIES, formatTypology } from '@/lib/typology'

export const dynamic = 'force-dynamic'

export async function GET() {
  const typologies = TYPOLOGIES.map((t) => ({
    value: t,
    label: formatTypology(t),
  }))
  return NextResponse.json(typologies)
}
