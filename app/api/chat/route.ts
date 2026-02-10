import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function formatCurrency(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

// Build Prisma where clause from filters
function buildWhere(filters: Record<string, unknown>): Prisma.FraudCaseWhereInput {
  const where: Prisma.FraudCaseWhereInput = {}
  if (filters?.scheme_type) where.schemeType = String(filters.scheme_type)
  if (filters?.county) where.county = String(filters.county)
  if (filters?.status) where.status = String(filters.status)
  if (filters?.min_amount) where.amountExposed = { gte: Number(filters.min_amount) }
  if (filters?.max_amount) {
    where.amountExposed = {
      ...(where.amountExposed as object),
      lte: Number(filters.max_amount),
    } as Prisma.DecimalFilter
  }
  if (filters?.start_date) where.dateFiled = { gte: new Date(String(filters.start_date)) }
  if (filters?.end_date) {
    where.dateFiled = {
      ...(where.dateFiled as object),
      lte: new Date(String(filters.end_date)),
    } as Prisma.DateTimeFilter
  }
  return where
}

// Topics we can reliably answer
const SUPPORTED_TOPICS =
  'totals, top fraud types, worst counties, recovery rate, EDD/PPP fraud, telemedicine, pharmacy, home health, lab testing, DME, average amounts'

export async function POST(request: NextRequest) {
  try {
    const { message, filters = {} } = await request.json()
    const q = (message || '').toLowerCase().trim()
    const where = buildWhere(filters as Record<string, unknown>)

    const [aggregates, schemeBreakdown, topCounties] = await Promise.all([
      prisma.fraudCase.aggregate({
        where,
        _count: true,
        _sum: { amountExposed: true, amountRecovered: true },
        _avg: { amountExposed: true },
      }),
      prisma.fraudCase.groupBy({
        where,
        by: ['schemeType'],
        _count: true,
        _sum: { amountExposed: true },
        orderBy: { _sum: { amountExposed: 'desc' } },
        take: 10,
      }),
      prisma.fraudCase.groupBy({
        where,
        by: ['county'],
        _count: true,
        _sum: { amountExposed: true },
        orderBy: { _sum: { amountExposed: 'desc' } },
        take: 5,
      }),
    ])

    const totalCases = aggregates._count
    const totalExposed = Number(aggregates._sum.amountExposed || 0)
    const totalRecovered = Number(aggregates._sum.amountRecovered || 0)
    const avgAmount = Number(aggregates._avg.amountExposed || 0)
    const recoveryRate = totalExposed > 0 ? (totalRecovered / totalExposed) * 100 : 0

    // Greeting / help
    if (!q || q.length < 2) {
      return NextResponse.json({
        response: `I'm the CaliFraud assistant. I can answer questions about California fraud data using our database — for example: totals, top schemes, worst counties, recovery rate, and specific fraud types (EDD, PPP, telemedicine, etc.).\n\nWhat would you like to know?`,
      })
    }

    if (
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey') ||
      q.includes('help') ||
      q.includes('what can') ||
      q.includes('how do i')
    ) {
      return NextResponse.json({
        response: `I can answer questions about: **${SUPPORTED_TOPICS}**.\n\nTry: "How much total fraud?", "Top fraud types?", "Worst counties?", or "EDD fraud stats?"`,
      })
    }

    // Totals / amount / exposed
    if (
      q.includes('how much') ||
      q.includes('total') ||
      q.includes('amount') ||
      q.includes('exposed') ||
      q.includes('overall') ||
      q.includes('aggregate')
    ) {
      const filterNote = Object.keys(where).length > 0
        ? ' (based on your current filters)'
        : ''
      return NextResponse.json({
        response: `Based on our data${filterNote}: **${totalCases.toLocaleString()}** fraud cases totaling **${formatCurrency(totalExposed)}** exposed. We've recovered **${formatCurrency(totalRecovered)}** so far.`,
      })
    }

    // Recovery
    if (
      q.includes('recovery') ||
      q.includes('recovered') ||
      q.includes('recover')
    ) {
      return NextResponse.json({
        response: `Recovery rate is **${recoveryRate.toFixed(2)}%**. We've recovered ${formatCurrency(totalRecovered)} out of ${formatCurrency(totalExposed)} exposed.`,
      })
    }

    // Top fraud types / schemes
    if (
      q.includes('type') ||
      q.includes('kind') ||
      q.includes('scheme') ||
      q.includes('top fraud') ||
      q.includes('most common') ||
      q.includes('categories')
    ) {
      const top = schemeBreakdown.slice(0, 5)
      if (top.length === 0) {
        return NextResponse.json({
          response: 'No scheme data matches your filters. Try clearing filters or asking about totals.',
        })
      }
      const list = top
        .map(
          (s, i) =>
            `${i + 1}. **${s.schemeType.replace(/_/g, ' ')}**: ${s._count.toLocaleString()} cases, ${formatCurrency(Number(s._sum.amountExposed || 0))}`
        )
        .join('\n')
      return NextResponse.json({
        response: `Top fraud types by amount:\n${list}`,
      })
    }

    // Counties / regions
    if (
      q.includes('county') ||
      q.includes('counties') ||
      q.includes('worst') ||
      q.includes('area') ||
      q.includes('region') ||
      q.includes('where')
    ) {
      if (topCounties.length === 0) {
        return NextResponse.json({
          response: 'No county data matches your filters. Try clearing filters.',
        })
      }
      const list = topCounties
        .map(
          (c, i) =>
            `${i + 1}. **${c.county}**: ${c._count.toLocaleString()} cases, ${formatCurrency(Number(c._sum.amountExposed || 0))}`
        )
        .join('\n')
      return NextResponse.json({
        response: `Worst counties by fraud amount:\n${list}`,
      })
    }

    // Average
    if (
      q.includes('average') ||
      q.includes('avg') ||
      q.includes('typical') ||
      q.includes('mean')
    ) {
      return NextResponse.json({
        response: `The average fraud case exposes **${formatCurrency(avgAmount)}**. We have ${totalCases.toLocaleString()} cases in our database.`,
      })
    }

    // EDD / unemployment
    if (q.includes('edd') || q.includes('unemployment')) {
      const edd = schemeBreakdown.find((s) =>
        s.schemeType.toLowerCase().includes('edd')
      )
      if (edd) {
        return NextResponse.json({
          response: `EDD/Unemployment fraud: **${edd._count.toLocaleString()}** cases, **${formatCurrency(Number(edd._sum.amountExposed || 0))}** exposed.`,
        })
      }
      return NextResponse.json({
        response: "I don't have EDD-specific data in the current results. Try clearing filters, or use the Scheme Type filter for 'EDD Unemployment' on the sidebar.",
      })
    }

    // PPP / COVID
    if (q.includes('ppp') || q.includes('covid') || q.includes('pandemic')) {
      const ppp = schemeBreakdown.find((s) =>
        s.schemeType.toLowerCase().includes('ppp')
      )
      if (ppp) {
        return NextResponse.json({
          response: `PPP fraud: **${ppp._count.toLocaleString()}** cases, **${formatCurrency(Number(ppp._sum.amountExposed || 0))}** exposed.`,
        })
      }
      return NextResponse.json({
        response: "I don't have PPP-specific data in the current results. Use the Scheme Type filter for 'PPP Fraud' on the sidebar to explore.",
      })
    }

    // Specific scheme types
    const schemeKeywords: Record<string, string> = {
      telemedicine: 'telemedicine',
      pharmacy: 'pharmacy',
      'home health': 'home_health',
      'lab test': 'lab_testing',
      'lab testing': 'lab_testing',
      dme: 'dme',
      hospice: 'hospice',
      'substance abuse': 'substance_abuse',
      insurance: 'insurance',
      'medi cal': 'medi_cal',
      mediCal: 'medi_cal',
      'calfresh': 'calfresh',
      'workers comp': 'workers_comp',
      'tax fraud': 'tax_fraud',
      'eidl': 'eidl',
    }

    for (const [keyword, schemeType] of Object.entries(schemeKeywords)) {
      if (q.includes(keyword)) {
        const match = schemeBreakdown.find(
          (s) => s.schemeType.toLowerCase() === schemeType.toLowerCase()
        )
        if (match) {
          return NextResponse.json({
            response: `**${match.schemeType.replace(/_/g, ' ')}** fraud: ${match._count.toLocaleString()} cases, **${formatCurrency(Number(match._sum.amountExposed || 0))}** exposed.`,
          })
        }
        return NextResponse.json({
          response: `I don't have specific data for "${keyword.replace(/_/g, ' ')}" in the current results. Try the Scheme Type filter on the sidebar, or ask about "top fraud types."`,
        })
      }
    }

    // Honest fallback — do NOT guess or hallucinate
    return NextResponse.json({
      response: `I can answer questions about: ${SUPPORTED_TOPICS}. I don't have a specific answer for that — try asking about totals, top schemes, worst counties, or a fraud type like EDD or telemedicine.`,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      response: 'Sorry, I had trouble fetching the data. Try again!',
    })
  }
}
