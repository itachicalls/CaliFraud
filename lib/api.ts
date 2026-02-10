/**
 * API client for CaliFraud Intelligence Platform
 * Uses Next.js API routes (same-origin)
 */

// Use relative paths since API routes are in the same app
const API_BASE = ''

export interface FraudCase {
  id: number
  case_number: string
  title: string
  description: string | null
  scheme_type: string
  typology?: string | null
  amount_exposed: number | null
  amount_recovered: number | null
  date_filed: string | null
  date_resolved: string | null
  status: string
  county: string
  city: string | null
  latitude: number | null
  longitude: number | null
  source_url: string | null
  still_operating?: boolean
  still_operating_source?: string | null
  entity_names?: string[] | null
  linked_entities?: { id: number; name: string; entity_type: string; role: string | null }[]
  created_at: string
}

export interface CasesResponse {
  total: number
  cases: FraudCase[]
  limit: number
  offset: number
}

export interface Summary {
  total_cases: number
  total_exposed: number
  total_recovered: number
  average_amount: number
  recovery_rate: number
  scheme_breakdown: {
    scheme_type: string
    count: number
    amount: number
  }[]
}

export interface HeatmapData {
  county: string
  case_count: number
  total_exposed: number
  latitude: number | null
  longitude: number | null
}

export interface TimelineData {
  year: number
  month: number
  period: string
  case_count: number
  total_exposed: number
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: {
      type: string
      coordinates: number[] | number[][] | number[][][]
    }
  }[]
}

export interface CaseFilters {
  scheme_type?: string
  typology?: string
  county?: string
  min_amount?: number
  max_amount?: number
  start_date?: string
  end_date?: string
  status?: string
  still_operating?: string
  limit?: number
  offset?: number
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

// Cases API
export const casesAPI = {
  list: (filters: CaseFilters = {}) =>
    fetchAPI<CasesResponse>(`/api/cases${buildQueryString(filters)}`),

  get: (id: number) => fetchAPI<FraudCase>(`/api/cases/${id}`),

  getSchemeTypes: () => fetchAPI<string[]>('/api/cases/scheme-types'),

  getTypologies: () =>
    fetchAPI<{ value: string; label: string }[]>('/api/cases/typologies'),

  getCounties: () => fetchAPI<string[]>('/api/cases/counties'),
}

// Analytics API
export const analyticsAPI = {
  summary: (filters: Omit<CaseFilters, 'limit' | 'offset'> = {}) =>
    fetchAPI<Summary>(`/api/analytics/summary${buildQueryString(filters)}`),

  heatmap: (filters: Pick<CaseFilters, 'scheme_type' | 'start_date' | 'end_date'> = {}) =>
    fetchAPI<HeatmapData[]>(`/api/analytics/heatmap${buildQueryString(filters)}`),

  timeline: (filters: { scheme_type?: string; county?: string; granularity?: string } = {}) =>
    fetchAPI<TimelineData[]>(`/api/analytics/timeline${buildQueryString(filters)}`),

  enforcementLag: (params: { group_by?: string; scheme_type?: string; county?: string } = {}) =>
    fetchAPI<{ group_by: string; results: { name: string; case_count: number; median_days: number; avg_days: number }[] }>(
      `/api/analytics/enforcement-lag${buildQueryString(params)}`
    ),

  riskIndex: (params: { by?: string; scheme_type?: string; county?: string } = {}) =>
    fetchAPI<{ by: string; results: { name: string; case_count: number; total_exposed: number; risk_index: number }[] }>(
      `/api/analytics/risk-index${buildQueryString(params)}`
    ),

  entityNetwork: (params: { entity_id?: number; case_id?: number; min_cases?: number } = {}) =>
    fetchAPI<{ entities?: { id: number; name: string; case_count: number }[] }>(
      `/api/analytics/entity-network${buildQueryString(params)}`
    ),

  accountability: (params: { still_operating?: string; limit?: number; offset?: number } = {}) =>
    fetchAPI<{
      total: number
      rows: {
        id: number
        case_number: string
        title: string
        scheme_type: string
        amount_exposed: number | null
        amount_recovered: number | null
        date_filed: string | null
        county: string
        city: string | null
        status: string
        source_url: string | null
        entity_names: string[]
        still_operating: boolean
        still_operating_source: string | null
      }[]
      limit: number
      offset: number
    }>(`/api/analytics/accountability${buildQueryString(params)}`),
}

// Geo API
export const geoAPI = {
  counties: () => fetchAPI<GeoJSONFeatureCollection>('/api/geo/counties'),

  californiaOutline: () =>
    fetchAPI<GeoJSONFeatureCollection>('/api/geo/outline'),

  points: (filters: CaseFilters = {}) =>
    fetchAPI<GeoJSONFeatureCollection>(`/api/geo/points${buildQueryString(filters)}`),
}
