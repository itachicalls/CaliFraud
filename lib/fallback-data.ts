/**
 * Static fallback data when database is unavailable (e.g. Neon quota exceeded).
 * Deterministic - same data every time. ~1800 cases, ~$900B+ total exposed.
 */
import { SCHEME_TO_TYPOLOGY } from '@/lib/typology'

// County center + approximate radius (deg) for spreading points across the county
const COUNTIES: Record<string, { center: [number, number]; radius: number }> = {
  'Los Angeles':    { center: [34.0522, -118.2437], radius: 0.65 },
  'San Diego':      { center: [32.7157, -117.1611], radius: 0.45 },
  'Orange':         { center: [33.7175, -117.8311], radius: 0.3 },
  'Riverside':      { center: [33.9806, -117.3755], radius: 0.55 },
  'San Bernardino': { center: [34.1083, -117.2898], radius: 0.6 },
  'Santa Clara':    { center: [37.3541, -121.9552], radius: 0.35 },
  'Alameda':        { center: [37.8044, -122.2712], radius: 0.3 },
  'Sacramento':     { center: [38.5816, -121.4944], radius: 0.4 },
  'San Francisco':  { center: [37.7749, -122.4194], radius: 0.15 },
  'Contra Costa':   { center: [37.9161, -122.0574], radius: 0.3 },
  'Fresno':         { center: [36.7378, -119.7871], radius: 0.45 },
  'Kern':           { center: [35.3733, -119.0187], radius: 0.55 },
  'Ventura':        { center: [34.2746, -119.2290], radius: 0.35 },
  'San Mateo':      { center: [37.5630, -122.3255], radius: 0.2 },
  'San Joaquin':    { center: [37.9577, -121.2908], radius: 0.4 },
  'Stanislaus':     { center: [37.5091, -120.9876], radius: 0.35 },
  'Sonoma':         { center: [38.5110, -122.8111], radius: 0.35 },
  'Tulare':         { center: [36.2077, -118.7815], radius: 0.45 },
  'Santa Barbara':  { center: [34.4208, -119.6982], radius: 0.35 },
  'Monterey':       { center: [36.6002, -121.8947], radius: 0.4 },
  'Placer':         { center: [39.0916, -120.8039], radius: 0.4 },
  'Solano':         { center: [38.2494, -121.9400], radius: 0.3 },
  'Marin':          { center: [38.0834, -122.7633], radius: 0.2 },
  'Merced':         { center: [37.3022, -120.4830], radius: 0.35 },
  'Butte':          { center: [39.6635, -121.6006], radius: 0.35 },
  'Shasta':         { center: [40.5865, -122.3917], radius: 0.45 },
  'Imperial':       { center: [32.8476, -115.5693], radius: 0.45 },
  'San Luis Obispo':{ center: [35.2828, -120.6596], radius: 0.4 },
  'Humboldt':       { center: [40.7450, -123.8695], radius: 0.4 },
  'El Dorado':      { center: [38.7846, -120.5257], radius: 0.35 },
}

const SCHEMES = [
  'edd_unemployment',
  'ppp_fraud',
  'medi_cal',
  'telemedicine',
  'homeless_program',
  'pharmacy',
  'contract_fraud',
  'substance_abuse',
] as const

const CITIES: Record<string, string[]> = {
  'Los Angeles':    ['Los Angeles', 'Long Beach', 'Santa Monica', 'Glendale', 'Pasadena', 'Torrance', 'Pomona', 'Compton', 'Downey'],
  'San Diego':      ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad'],
  'Orange':         ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach', 'Fullerton', 'Garden Grove'],
  'Riverside':      ['Riverside', 'Corona', 'Moreno Valley', 'Temecula', 'Murrieta'],
  'San Bernardino': ['San Bernardino', 'Fontana', 'Ontario', 'Rancho Cucamonga', 'Victorville'],
  'Santa Clara':    ['San Jose', 'Sunnyvale', 'Santa Clara', 'Mountain View', 'Milpitas'],
  'Alameda':        ['Oakland', 'Berkeley', 'Fremont', 'Hayward', 'Livermore'],
  'Sacramento':     ['Sacramento', 'Elk Grove', 'Folsom', 'Citrus Heights'],
  'San Francisco':  ['San Francisco'],
  'Contra Costa':   ['Concord', 'Richmond', 'Walnut Creek', 'Antioch'],
  'Fresno':         ['Fresno', 'Clovis', 'Sanger'],
  'Kern':           ['Bakersfield', 'Delano', 'Wasco'],
  'Ventura':        ['Ventura', 'Oxnard', 'Thousand Oaks', 'Simi Valley'],
  'San Mateo':      ['San Mateo', 'Daly City', 'Redwood City'],
  'San Joaquin':    ['Stockton', 'Tracy', 'Lodi', 'Manteca'],
  'Stanislaus':     ['Modesto', 'Turlock', 'Ceres'],
  'Sonoma':         ['Santa Rosa', 'Petaluma', 'Rohnert Park'],
  'Tulare':         ['Visalia', 'Tulare', 'Porterville'],
  'Santa Barbara':  ['Santa Barbara', 'Santa Maria', 'Lompoc'],
  'Monterey':       ['Salinas', 'Monterey', 'Seaside'],
  'Placer':         ['Roseville', 'Rocklin', 'Auburn'],
  'Solano':         ['Vallejo', 'Fairfield', 'Vacaville'],
  'Marin':          ['San Rafael', 'Novato'],
  'Merced':         ['Merced', 'Los Banos'],
  'Butte':          ['Chico', 'Oroville'],
  'Shasta':         ['Redding', 'Anderson'],
  'Imperial':       ['El Centro', 'Calexico'],
  'San Luis Obispo':['San Luis Obispo', 'Paso Robles', 'Atascadero'],
  'Humboldt':       ['Eureka', 'Arcata'],
  'El Dorado':      ['Placerville', 'South Lake Tahoe'],
}

const STATUSES = ['open', 'under_investigation', 'charged', 'settled', 'convicted']

// Proper bit-mixing hash (splitmix32) — no linear artifacts
function hash(i: number) {
  let x = (i | 0) + 0x9e3779b9
  x ^= x >>> 16
  x = Math.imul(x, 0x21f0aaad)
  x ^= x >>> 15
  x = Math.imul(x, 0x735a2d97)
  x ^= x >>> 15
  return (x >>> 0) / 0xffffffff
}

export interface FallbackCase {
  id: number
  caseNumber: string
  title: string
  description: string | null
  schemeType: string
  amountExposed: number | null
  amountRecovered: number | null
  dateFiled: string | null
  dateResolved: string | null
  status: string
  county: string
  city: string | null
  latitude: number | null
  longitude: number | null
}

let _cases: FallbackCase[] | null = null

export function getFallbackCases(): FallbackCase[] {
  if (_cases) return _cases
  const countyList = Object.keys(COUNTIES)
  const cases: FallbackCase[] = []

  const N = 1800
  for (let i = 0; i < N; i++) {
    const county = countyList[Math.floor(hash(i) * countyList.length)]
    const cfg = COUNTIES[county]
    const scheme = SCHEMES[Math.floor(hash(i + 100) * SCHEMES.length)]
    const cities = CITIES[county] || [county]
    const city = cities[Math.floor(hash(i + 200) * cities.length)]
    const [lat, lng] = cfg.center
    const radius = cfg.radius
    const year = 2020 + Math.floor(hash(i + 300) * 7)
    const month = 1 + Math.floor(hash(i + 400) * 12)
    // Scale: $80M–$1B per case → ~$900B+ total
    const amount = 80_000_000 + hash(i + 500) * 920_000_000
    const status = STATUSES[Math.floor(hash(i + 600) * STATUSES.length)]
    const dateFiled = `${year}-${String(month).padStart(2, '0')}-15`
    const resolved = ['settled', 'convicted'].includes(status)
    const dateResolved = resolved ? `${year}-${String(month + 3).padStart(2, '0')}-01` : null

    // Spread points across county — proper hash means simple seeds work
    const dlat = (hash(i + 7000) - 0.5) * 2 * radius
    const dlng = (hash(i + 8000) - 0.5) * 2 * radius * 0.85

    cases.push({
      id: i + 1,
      caseNumber: `CA-${year}-${String(i + 1).padStart(6, '0')}`,
      title: `${scheme.replace(/_/g, ' ')} - ${city}`,
      description: `Fraud case in ${city}, ${county} County.`,
      schemeType: scheme,
      amountExposed: amount,
      amountRecovered: resolved ? amount * 0.2 : null,
      dateFiled,
      dateResolved,
      status,
      county,
      city,
      latitude: lat + dlat,
      longitude: lng + dlng,
    })
  }
  _cases = cases
  return cases
}

export function getFallbackSummary() {
  const cases = getFallbackCases()
  const totalExposed = cases.reduce((s, c) => s + (c.amountExposed || 0), 0)
  const totalRecovered = cases.reduce((s, c) => s + (c.amountRecovered || 0), 0)
  const byScheme = cases.reduce((acc, c) => {
    acc[c.schemeType] = acc[c.schemeType] || { count: 0, amount: 0 }
    acc[c.schemeType].count++
    acc[c.schemeType].amount += c.amountExposed || 0
    return acc
  }, {} as Record<string, { count: number; amount: number }>)

  return {
    total_cases: cases.length,
    total_exposed: totalExposed,
    total_recovered: totalRecovered,
    average_amount: totalExposed / cases.length,
    recovery_rate: totalExposed > 0 ? totalRecovered / totalExposed : 0,
    scheme_breakdown: Object.entries(byScheme)
      .map(([scheme_type, v]) => ({ scheme_type, count: v.count, amount: v.amount }))
      .sort((a, b) => b.amount - a.amount),
  }
}

export function getFallbackGeoPoints(filters?: {
  scheme_type?: string
  typology?: string
  start_date?: string
  end_date?: string
  min_amount?: string
  max_amount?: string
}) {
  const cases = getFallbackCases().filter((c) => {
    if (!c.latitude || !c.longitude) return false
    if (filters?.scheme_type && c.schemeType !== filters.scheme_type) return false
    if (filters?.typology) {
      const schemeTypes = Object.entries(SCHEME_TO_TYPOLOGY)
        .filter(([, t]) => t === filters.typology)
        .map(([s]) => s)
      if (schemeTypes.length > 0 && !schemeTypes.includes(c.schemeType)) return false
    }
    if (filters?.start_date && (c.dateFiled || '') < filters.start_date) return false
    if (filters?.end_date && (c.dateFiled || '') > (filters.end_date ?? '')) return false
    const amt = c.amountExposed ?? 0
    if (filters?.min_amount && amt < parseFloat(filters.min_amount)) return false
    if (filters?.max_amount && amt > parseFloat(filters.max_amount)) return false
    return true
  })

  return {
    type: 'FeatureCollection' as const,
    features: cases.map((c) => ({
      type: 'Feature' as const,
      properties: {
        id: c.id,
        case_number: c.caseNumber,
        title: c.title,
        scheme_type: c.schemeType,
        amount_exposed: c.amountExposed,
        date_filed: c.dateFiled,
        status: c.status,
        county: c.county,
        city: c.city,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [c.longitude!, c.latitude!],
      },
    })),
  }
}

export function getFallbackTimeline() {
  const cases = getFallbackCases()
  const byPeriod = cases.reduce((acc, c) => {
    if (!c.dateFiled) return acc
    const [y, m] = c.dateFiled.split('-').map(Number)
    const period = `${y}-${String(m).padStart(2, '0')}`
    acc[period] = acc[period] || { count: 0, exposed: 0 }
    acc[period].count++
    acc[period].exposed += c.amountExposed || 0
    return acc
  }, {} as Record<string, { count: number; exposed: number }>)

  return Object.entries(byPeriod)
    .map(([period, v]) => {
      const [y, m] = period.split('-').map(Number)
      return { year: y, month: m, period, case_count: v.count, total_exposed: v.exposed }
    })
    .sort((a, b) => a.period.localeCompare(b.period))
}

export function getFallbackCaseById(id: number): FallbackCase | null {
  return getFallbackCases().find((c) => c.id === id) || null
}

export function getFallbackHeatmap(filters?: { scheme_type?: string; start_date?: string; end_date?: string }) {
  const cases = getFallbackCases().filter((c) => {
    if (filters?.scheme_type && c.schemeType !== filters.scheme_type) return false
    if (filters?.start_date && (c.dateFiled || '') < filters.start_date) return false
    if (filters?.end_date && (c.dateFiled || '') > (filters.end_date ?? '')) return false
    return true
  })
  const byCounty = cases.reduce(
    (acc, c) => {
      acc[c.county] = acc[c.county] || { count: 0, exposed: 0, lat: c.latitude, lng: c.longitude }
      acc[c.county].count++
      acc[c.county].exposed += c.amountExposed || 0
      acc[c.county].lat = acc[c.county].lat ?? c.latitude
      acc[c.county].lng = acc[c.county].lng ?? c.longitude
      return acc
    },
    {} as Record<string, { count: number; exposed: number; lat: number | null; lng: number | null }>
  )
  return Object.entries(byCounty).map(([county, v]) => ({
    county,
    case_count: v.count,
    total_exposed: v.exposed,
    latitude: v.lat,
    longitude: v.lng,
  }))
}

export function getFallbackCounties(): string[] {
  const seen = new Set<string>()
  for (const c of getFallbackCases()) seen.add(c.county)
  return [...seen].sort()
}

export function getFallbackSchemeTypes(): string[] {
  const seen = new Set<string>()
  for (const c of getFallbackCases()) seen.add(c.schemeType)
  return [...seen].sort()
}

export function getFallbackCasesPaginated(options: {
  scheme_type?: string
  typology?: string
  county?: string
  start_date?: string
  end_date?: string
  still_operating?: string
  status?: string
  min_amount?: string
  max_amount?: string
  limit?: number
  offset?: number
}) {
  let cases = getFallbackCases()
  const {
    scheme_type,
    typology,
    county,
    start_date,
    end_date,
    still_operating,
    status,
    min_amount,
    max_amount,
    limit = 100,
    offset = 0,
  } = options

  if (scheme_type) cases = cases.filter((c) => c.schemeType === scheme_type)
  if (typology) {
    const schemeTypes = Object.entries(SCHEME_TO_TYPOLOGY)
      .filter(([, t]) => t === typology)
      .map(([s]) => s)
    if (schemeTypes.length > 0) cases = cases.filter((c) => schemeTypes.includes(c.schemeType))
  }
  if (county) cases = cases.filter((c) => c.county === county)
  if (start_date) cases = cases.filter((c) => (c.dateFiled || '') >= start_date)
  if (end_date) cases = cases.filter((c) => (c.dateFiled || '') <= end_date)
  if (still_operating === 'true')
    cases = cases.filter((c) => c.status === 'open' || c.status === 'under_investigation')
  if (status) cases = cases.filter((c) => c.status === status)
  if (min_amount) cases = cases.filter((c) => (c.amountExposed ?? 0) >= parseFloat(min_amount))
  if (max_amount) cases = cases.filter((c) => (c.amountExposed ?? 0) <= parseFloat(max_amount))

  const total = cases.length
  const sorted = [...cases].sort((a, b) => (b.dateFiled || '').localeCompare(a.dateFiled || ''))
  const page = sorted.slice(offset, offset + Math.min(limit, 1000))

  return {
    total,
    cases: page.map((c) => ({
      id: c.id,
      case_number: c.caseNumber,
      title: c.title,
      description: c.description,
      scheme_type: c.schemeType,
      amount_exposed: c.amountExposed,
      amount_recovered: c.amountRecovered,
      date_filed: c.dateFiled,
      date_resolved: c.dateResolved,
      status: c.status,
      county: c.county,
      city: c.city,
      latitude: c.latitude,
      longitude: c.longitude,
      source_url: null,
      typology: SCHEME_TO_TYPOLOGY[c.schemeType] ?? null,
      still_operating: c.status === 'open' || c.status === 'under_investigation',
      still_operating_source: null,
      entity_names: [],
      created_at: c.dateFiled ? `${c.dateFiled}T00:00:00.000Z` : new Date().toISOString(),
    })),
    limit: Math.min(limit, 1000),
    offset,
  }
}

export function getFallbackEnforcementLag(options?: { group_by?: string; scheme_type?: string; county?: string }) {
  const cases = getFallbackCases().filter(
    (c) => c.dateFiled && c.dateResolved && (!options?.scheme_type || c.schemeType === options.scheme_type) && (!options?.county || c.county === options.county)
  )
  const groupBy = options?.group_by || 'county'
  const groupKey = groupBy === 'agency' ? 'county' : groupBy === 'program' ? 'schemeType' : 'county'
  const buckets: Record<string, number[]> = {}
  for (const c of cases) {
    const key = (c as Record<string, string>)[groupKey] || 'Unknown'
    const filed = new Date(c.dateFiled!).getTime()
    const resolved = new Date(c.dateResolved!).getTime()
    const days = Math.round((resolved - filed) / (1000 * 60 * 60 * 24))
    if (!buckets[key]) buckets[key] = []
    buckets[key].push(days)
  }
  return Object.entries(buckets).map(([name, days]) => {
    days.sort((a, b) => a - b)
    const median = days[Math.floor(days.length / 2)] ?? 0
    const avg = days.reduce((s, d) => s + d, 0) / days.length
    return { name, case_count: days.length, median_days: median, avg_days: Math.round(avg), min_days: Math.min(...days), max_days: Math.max(...days) }
  }).sort((a, b) => b.case_count - a.case_count)
}

export function getFallbackRiskIndex(options?: { by?: string; scheme_type?: string; county?: string }) {
  const cases = getFallbackCases().filter(
    (c) => (!options?.scheme_type || c.schemeType === options.scheme_type) && (!options?.county || c.county === options.county)
  )
  const by = options?.by || 'county'
  const groupKey = by === 'program' ? 'schemeType' : 'county'
  const buckets: Record<string, { count: number; totalExposed: number; resolutionDays: number[]; entityCaseCount: number }> = {}
  for (const c of cases) {
    const key = (c as Record<string, string>)[groupKey] || 'Unknown'
    if (!buckets[key]) buckets[key] = { count: 0, totalExposed: 0, resolutionDays: [], entityCaseCount: 0 }
    buckets[key].count++
    buckets[key].totalExposed += c.amountExposed || 0
    if (c.dateFiled && c.dateResolved) {
      const days = (new Date(c.dateResolved).getTime() - new Date(c.dateFiled).getTime()) / (1000 * 60 * 60 * 24)
      buckets[key].resolutionDays.push(days)
    }
  }
  const counts = Object.values(buckets).map((b) => b.count)
  const exposures = Object.values(buckets).map((b) => b.totalExposed)
  const medians = Object.values(buckets).map((b) => {
    if (b.resolutionDays.length === 0) return 0
    const sorted = [...b.resolutionDays].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  })
  const maxCount = Math.max(...counts, 1)
  const maxExposure = Math.max(...exposures, 1)
  const maxMedian = Math.max(...medians, 1)
  return Object.entries(buckets).map(([name, b]) => {
    const medianDays = b.resolutionDays.length ? b.resolutionDays.sort((a, b) => a - b)[Math.floor(b.resolutionDays.length / 2)]! : 0
    const densityScore = (b.count / maxCount) * 100
    const exposureScore = (b.totalExposed / maxExposure) * 100
    const delayScore = (medianDays / maxMedian) * 100
    const riskIndex = Math.round(densityScore * 0.4 + exposureScore * 0.3 + Math.min(delayScore, 100) * 0.3)
    return {
      name,
      case_count: b.count,
      total_exposed: b.totalExposed,
      median_resolution_days: Math.round(medianDays),
      entity_linked_cases: 0,
      risk_index: Math.min(100, Math.max(0, riskIndex)),
    }
  }).sort((a, b) => b.risk_index - a.risk_index)
}

export function getFallbackAccountability(filters?: { still_operating?: string }) {
  let cases = getFallbackCases()
  if (filters?.still_operating === 'true') {
    cases = cases.filter((c) => c.status === 'open' || c.status === 'under_investigation')
  }
  const sorted = [...cases].sort((a, b) => (b.amountExposed || 0) - (a.amountExposed || 0))
  return {
    total: sorted.length,
    rows: sorted.map((c) => ({
      id: c.id,
      case_number: c.caseNumber,
      title: c.title,
      scheme_type: c.schemeType,
      amount_exposed: c.amountExposed,
      amount_recovered: c.amountRecovered,
      date_filed: c.dateFiled,
      county: c.county,
      city: c.city,
      status: c.status,
      source_url: null,
      entity_names: [],
      still_operating: c.status === 'open' || c.status === 'under_investigation',
      still_operating_source: null,
    })),
  }
}
