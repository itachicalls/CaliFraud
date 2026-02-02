/**
 * React Query hooks for fraud data
 */

import { useQuery } from '@tanstack/react-query'
import { casesAPI, analyticsAPI, geoAPI, CaseFilters } from '@/lib/api'
import { useFilterStore } from '@/stores/filters'

export function useCases(extraFilters?: CaseFilters) {
  const filters = useFilterStore((state) => state.getActiveFilters())

  return useQuery({
    queryKey: ['cases', { ...filters, ...extraFilters }],
    queryFn: () => casesAPI.list({ ...filters, ...extraFilters } as CaseFilters),
  })
}

export function useCase(id: number | null) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => (id ? casesAPI.get(id) : null),
    enabled: id !== null,
  })
}

export function useSummary() {
  const filters = useFilterStore((state) => state.getActiveFilters())

  return useQuery({
    queryKey: ['summary', filters],
    queryFn: () => analyticsAPI.summary(filters as CaseFilters),
  })
}

export function useHeatmap() {
  const schemeType = useFilterStore((state) => state.schemeType)
  const startDate = useFilterStore((state) => state.startDate)
  const endDate = useFilterStore((state) => state.endDate)

  return useQuery({
    queryKey: ['heatmap', { schemeType, startDate, endDate }],
    queryFn: () =>
      analyticsAPI.heatmap({
        scheme_type: schemeType || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
  })
}

export function useTimeline() {
  const schemeType = useFilterStore((state) => state.schemeType)
  const county = useFilterStore((state) => state.county)

  return useQuery({
    queryKey: ['timeline', { schemeType, county }],
    queryFn: () =>
      analyticsAPI.timeline({
        scheme_type: schemeType || undefined,
        county: county || undefined,
      }),
  })
}

export function useCasePoints() {
  const filters = useFilterStore((state) => state.getActiveFilters())

  return useQuery({
    queryKey: ['casePoints', filters],
    queryFn: () => geoAPI.points(filters as CaseFilters),
  })
}

export function useCounties() {
  return useQuery({
    queryKey: ['counties'],
    queryFn: () => geoAPI.counties(),
    staleTime: Infinity,
  })
}

export function useCaliforniaOutline() {
  return useQuery({
    queryKey: ['californiaOutline'],
    queryFn: () => geoAPI.californiaOutline(),
    staleTime: Infinity,
  })
}

export function useSchemeTypes() {
  return useQuery({
    queryKey: ['schemeTypes'],
    queryFn: () => casesAPI.getSchemeTypes(),
    staleTime: Infinity,
  })
}

export function useCountyList() {
  return useQuery({
    queryKey: ['countyList'],
    queryFn: () => casesAPI.getCounties(),
    staleTime: Infinity,
  })
}
