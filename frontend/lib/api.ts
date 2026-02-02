/**
 * API client for California Fraud Intelligence backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface FraudCase {
  id: number
  case_number: string
  title: string
  description: string | null
  scheme_type: string
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
  county?: string
  min_amount?: number
  max_amount?: number
  start_date?: string
  end_date?: string
  status?: string
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

  getSchemeTypes: () => fetchAPI<string[]>('/api/cases/scheme-types/list'),

  getCounties: () => fetchAPI<string[]>('/api/cases/counties/list'),
}

// Analytics API
export const analyticsAPI = {
  summary: (filters: Omit<CaseFilters, 'limit' | 'offset'> = {}) =>
    fetchAPI<Summary>(`/api/analytics/summary${buildQueryString(filters)}`),

  heatmap: (filters: Pick<CaseFilters, 'scheme_type' | 'start_date' | 'end_date'> = {}) =>
    fetchAPI<HeatmapData[]>(`/api/analytics/heatmap${buildQueryString(filters)}`),

  timeline: (filters: { scheme_type?: string; county?: string; granularity?: string } = {}) =>
    fetchAPI<TimelineData[]>(`/api/analytics/timeline${buildQueryString(filters)}`),
}

// Geo API
export const geoAPI = {
  counties: () => fetchAPI<GeoJSONFeatureCollection>('/api/geo/counties'),

  points: (filters: CaseFilters = {}) =>
    fetchAPI<GeoJSONFeatureCollection>(`/api/geo/points${buildQueryString(filters)}`),

  californiaOutline: () => fetchAPI<GeoJSONFeatureCollection['features'][0]>('/api/geo/california-outline'),
}
