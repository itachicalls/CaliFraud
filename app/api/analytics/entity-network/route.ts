import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Entity network: cases linked by shared entities (providers, NPIs, EINs, etc.)
 * Returns entities with multiple cases (recidivism) and linked case clusters.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entity_id')
    const caseId = searchParams.get('case_id')
    const minCases = parseInt(searchParams.get('min_cases') || '2', 10)

    if (entityId) {
      const id = parseInt(entityId, 10)
      if (isNaN(id)) return NextResponse.json({ entities: [], links: [] })

      const entity = await prisma.entity.findUnique({
        where: { id },
        include: {
          caseEntities: {
            include: { case: true },
          },
        },
      })
      if (!entity) return NextResponse.json({ entities: [], links: [] })

      const cases = entity.caseEntities.map((ce) => ({
        id: ce.case.id,
        case_number: ce.case.caseNumber,
        title: ce.case.title,
        county: ce.case.county,
        scheme_type: ce.case.schemeType,
        amount_exposed: ce.case.amountExposed ? Number(ce.case.amountExposed) : null,
        date_filed: ce.case.dateFiled?.toISOString().split('T')[0] || null,
      }))

      return NextResponse.json({
        entity: {
          id: entity.id,
          name: entity.name,
          entity_type: entity.entityType,
          npi: entity.npi,
          ein: entity.ein,
        },
        linked_cases: cases,
      })
    }

    if (caseId) {
      const id = parseInt(caseId, 10)
      if (isNaN(id)) return NextResponse.json({ entities: [], linked_cases: [] })

      const fraudCase = await prisma.fraudCase.findUnique({
        where: { id },
        include: {
          caseEntities: {
            include: { entity: true },
          },
        },
      })
      if (!fraudCase) return NextResponse.json({ entities: [], linked_cases: [] })

      const entities = fraudCase.caseEntities.map((ce) => ({
        id: ce.entity.id,
        name: ce.entity.name,
        entity_type: ce.entity.entityType,
        npi: ce.entity.npi,
        ein: ce.entity.ein,
        role: ce.role,
      }))

      return NextResponse.json({
        case_id: fraudCase.id,
        entities,
      })
    }

    // List entities with multiple cases (recidivism)
    const recidivistEntities = await prisma.entity.findMany({
      include: {
        _count: { select: { caseEntities: true } },
        caseEntities: { select: { caseId: true } },
      },
      where: {
        caseEntities: { some: {} },
      },
    })

    const withMultipleCases = recidivistEntities.filter((e) => e._count.caseEntities >= minCases)

    const entities = withMultipleCases.map((e) => ({
      id: e.id,
      name: e.name,
      entity_type: e.entityType,
      npi: e.npi,
      ein: e.ein,
      case_count: e._count.caseEntities,
      case_ids: e.caseEntities.map((ce) => ce.caseId),
    }))

    entities.sort((a, b) => b.case_count - a.case_count)

    return NextResponse.json({ entities })
  } catch (error) {
    console.error('Entity network API error:', error)
    return NextResponse.json({ entities: [] })
  }
}
