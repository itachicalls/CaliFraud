'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'

function formatCurrency(n: number | null) {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export default function AccountabilityTrackerTab() {
  const [stillOperatingFilter, setStillOperatingFilter] = useState<'all' | 'true'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['accountability', stillOperatingFilter],
    queryFn: () =>
      analyticsAPI.accountability({
        still_operating: stillOperatingFilter === 'true' ? 'true' : undefined,
        limit: 500,
      }),
  })

  const rows = data?.rows ?? []
  const total = data?.total ?? 0

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 overflow-auto max-h-[calc(100vh-120px)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-text-primary">Accountability Tracker</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Filter:</label>
          <select
            value={stillOperatingFilter}
            onChange={(e) => setStillOperatingFilter(e.target.value as 'all' | 'true')}
            className="px-3 py-2 text-sm rounded-lg border border-california-border bg-white"
          >
            <option value="all">All cases</option>
            <option value="true">Still operating (sanctioned)</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Showing entities and businesses linked to fraud. Names and amounts from public records.
        {stillOperatingFilter === 'true' && ' Filtered to cases where the entity is flagged as still operating.'}
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-california-border/30 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-california-border">
                <th className="text-left py-3 px-2 font-semibold text-text-primary">Case / Business</th>
                <th className="text-left py-3 px-2 font-semibold text-text-primary hidden md:table-cell">Entities</th>
                <th className="text-right py-3 px-2 font-semibold text-text-primary">Amount</th>
                <th className="text-left py-3 px-2 font-semibold text-text-primary hidden lg:table-cell">Location</th>
                <th className="text-center py-3 px-2 font-semibold text-text-primary">Still operating</th>
                <th className="text-left py-3 px-2 font-semibold text-text-primary hidden sm:table-cell">Date filed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-california-border/50 hover:bg-california-sand/30">
                  <td className="py-3 px-2">
                    <span className="font-medium text-text-primary line-clamp-2">{r.title}</span>
                    <span className="text-text-tertiary text-xs">#{r.case_number}</span>
                  </td>
                  <td className="py-3 px-2 text-text-secondary hidden md:table-cell">
                    {r.entity_names?.length ? (
                      <span className="line-clamp-2">{r.entity_names.join(', ')}</span>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-california-poppy">
                    {formatCurrency(r.amount_exposed)}
                  </td>
                  <td className="py-3 px-2 text-text-secondary hidden lg:table-cell">
                    {[r.city, r.county].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {r.still_operating ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-fraud-critical" />
                        <span className="text-fraud-critical font-medium">Yes</span>
                        {r.still_operating_source && (
                          <a
                            href={r.still_operating_source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-california-pacific hover:underline"
                          >
                            source
                          </a>
                        )}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">No</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-text-secondary hidden sm:table-cell">
                    {r.date_filed ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <p className="text-xs text-text-tertiary mt-4">
          Showing {rows.length} of {total.toLocaleString()} cases. Sorted by amount exposed (highest first).
        </p>
      )}

      {!isLoading && rows.length === 0 && (
        <p className="text-text-secondary py-8 text-center">No cases match the current filter.</p>
      )}
    </div>
  )
}
