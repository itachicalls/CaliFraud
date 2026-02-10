import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const caseId = parseInt(id, 10)
    if (isNaN(caseId)) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 })
    }

    let c: Awaited<ReturnType<typeof prisma.fraudCase.findUnique>>
    try {
      c = await prisma.fraudCase.findUnique({
        where: { id: caseId },
        include: { caseEntities: { include: { entity: true } } },
      })
    } catch {
      c = await prisma.fraudCase.findUnique({
        where: { id: caseId },
      })
    }

    if (!c) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const fc = c as typeof c & {
      typology?: string | null
      stillOperating?: boolean
      stillOperatingSource?: string | null
      entityNames?: string[] | null
    }

    return NextResponse.json({
      id: c.id,
      case_number: c.caseNumber,
      title: c.title,
      description: c.description,
      scheme_type: c.schemeType,
      typology: fc.typology ?? null,
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
      still_operating: fc.stillOperating ?? false,
      still_operating_source: fc.stillOperatingSource ?? null,
      entity_names: fc.entityNames ?? ('caseEntities' in c && Array.isArray(c.caseEntities) ? c.caseEntities.map((ce: { entity: { name: string } }) => ce.entity.name) : []),
      linked_entities: 'caseEntities' in c && Array.isArray(c.caseEntities) ? c.caseEntities.map((ce: { entity: { id: number; name: string; entityType: string }; role: string | null }) => ({
        id: ce.entity.id,
        name: ce.entity.name,
        entity_type: ce.entity.entityType,
        role: ce.role,
      })) : [],
      created_at: c.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Case API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
