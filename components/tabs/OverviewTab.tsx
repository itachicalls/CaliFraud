'use client'

import { useSummary } from '@/hooks/useFraudData'

function formatCurrency(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export default function OverviewTab() {
  const { data: summary, isLoading: summaryLoading } = useSummary()

  if (summaryLoading && !summary) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 bg-california-border/30 rounded animate-pulse w-3/4" />
        <div className="h-32 bg-california-border/30 rounded animate-pulse" />
      </div>
    )
  }

  const totalCases = summary?.total_cases ?? 0
  const totalExposed = summary?.total_exposed ?? 0
  const totalRecovered = summary?.total_recovered ?? 0
  const recoveryRate = summary?.recovery_rate ?? 0
  const topSchemes = summary?.scheme_breakdown?.slice(0, 5) ?? []

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-120px)]">
      <h1 className="text-2xl font-bold text-text-primary">
        California Fraud: COVID to 2026
      </h1>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">How fraud has ballooned</h2>
        <p className="text-text-primary leading-relaxed">
          Since the onset of the COVID-19 pandemic in 2020, fraud across California programs has exploded. 
          Federal relief programs (EDD unemployment, PPP, EIDL), state healthcare (Medi-Cal, telemedicine), 
          homeless housing initiatives, and other programs have been targeted at an unprecedented scale.
        </p>
        <p className="text-text-primary leading-relaxed mt-3">
          Our data tracks <strong>{totalCases.toLocaleString()} fraud cases</strong> totaling{' '}
          <strong>{formatCurrency(totalExposed)}</strong> in exposed funds from 2020 through 2026. 
          Of that, only <strong>{formatCurrency(totalRecovered)}</strong> has been recovered—a recovery rate of{' '}
          <strong>{(recoveryRate * 100).toFixed(2)}%</strong>.
        </p>
      </section>

      <section className="bg-california-sand rounded-card p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">Key numbers (from our database)</h3>
        <ul className="space-y-2 text-text-primary">
          <li><strong>Total cases:</strong> {totalCases.toLocaleString()}</li>
          <li><strong>Total exposed:</strong> {formatCurrency(totalExposed)}</li>
          <li><strong>Total recovered:</strong> {formatCurrency(totalRecovered)}</li>
          <li><strong>Recovery rate:</strong> {(recoveryRate * 100).toFixed(2)}%</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-text-primary mb-3">Top fraud types by amount</h3>
        {topSchemes.length > 0 ? (
          <ul className="space-y-2">
            {topSchemes.map((s, i) => (
              <li key={s.scheme_type} className="flex justify-between text-text-primary">
                <span>{i + 1}. {s.scheme_type.replace(/_/g, ' ')}</span>
                <span className="font-medium">{formatCurrency(s.amount)} ({s.count.toLocaleString()} cases)</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">No scheme breakdown available.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">No one is being held accountable</h2>
        <p className="text-text-primary leading-relaxed">
          Despite billions in exposed fraud, enforcement lags far behind. Cases take months or years to resolve. 
          Many sanctioned entities remain licensed or continue billing. Recovery rates are a fraction of what was stolen.
        </p>
        <p className="text-text-primary leading-relaxed mt-3">
          Use the <strong>Accountability Tracker</strong> tab to see which businesses and entities are linked to fraud 
          and whether they are still operating. Use the map and timeline to explore the data.
        </p>
      </section>

      <section className="text-sm text-text-tertiary border-t border-california-border pt-4">
        <p>
          Data sourced from public records. Recovery rates and case counts reflect our database as of the last update. 
          Use filters on the map view to explore by scheme type, county, and date range.
        </p>
      </section>
    </div>
  )
}
