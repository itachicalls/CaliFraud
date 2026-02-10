'use client'

import { useState } from 'react'
import { useEnforcementLag, useRiskIndex, useEntityNetwork } from '@/hooks/useFraudData'

export default function AnalyticsPanel() {
  const [activeTab, setActiveTab] = useState<'risk' | 'lag' | 'recidivism'>('risk')

  const { data: riskData, isLoading: riskLoading } = useRiskIndex({ by: 'county' })
  const { data: lagData, isLoading: lagLoading } = useEnforcementLag({ group_by: 'county' })
  const { data: entityData, isLoading: entityLoading } = useEntityNetwork({ min_cases: 2 })

  return (
    <div className="border-t border-california-border">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Systemic insight</h3>
        <div className="flex gap-2 mb-3">
          {(['risk', 'lag', 'recidivism'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                activeTab === tab
                  ? 'bg-california-poppy text-white'
                  : 'bg-california-sand text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'risk' && 'Risk index'}
              {tab === 'lag' && 'Enforcement lag'}
              {tab === 'recidivism' && 'Recidivism'}
            </button>
          ))}
        </div>

        {activeTab === 'risk' && (
          <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
            <p className="text-text-tertiary">
              Fraud Risk Index (0–100) by county. Based on case density, dollar exposure, recidivism, enforcement delay.
            </p>
            {riskLoading ? (
              <div className="h-24 bg-california-border/30 rounded animate-pulse" />
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-california-border">
                    <th className="py-1 font-medium">County</th>
                    <th className="py-1 font-medium text-right">Index</th>
                    <th className="py-1 font-medium text-right">Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData?.results?.slice(0, 10).map((r) => (
                    <tr key={r.name} className="border-b border-california-border/50">
                      <td className="py-1.5">{r.name}</td>
                      <td className="py-1.5 text-right">
                        <span
                          className={
                            r.risk_index >= 70
                              ? 'text-fraud-critical font-medium'
                              : r.risk_index >= 40
                              ? 'text-california-poppy'
                              : ''
                          }
                        >
                          {r.risk_index}
                        </span>
                      </td>
                      <td className="py-1.5 text-right text-text-tertiary">{r.case_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'lag' && (
          <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
            <p className="text-text-tertiary">
              Median days from case filed to resolution, by county.
            </p>
            {lagLoading ? (
              <div className="h-24 bg-california-border/30 rounded animate-pulse" />
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-california-border">
                    <th className="py-1 font-medium">County</th>
                    <th className="py-1 font-medium text-right">Median days</th>
                    <th className="py-1 font-medium text-right">Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {lagData?.results?.slice(0, 10).map((r) => (
                    <tr key={r.name} className="border-b border-california-border/50">
                      <td className="py-1.5">{r.name}</td>
                      <td className="py-1.5 text-right">{r.median_days}</td>
                      <td className="py-1.5 text-right text-text-tertiary">{r.case_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'recidivism' && (
          <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
            <p className="text-text-tertiary">
              Entities linked to multiple cases (repeat offenders).
            </p>
            {entityLoading ? (
              <div className="h-24 bg-california-border/30 rounded animate-pulse" />
            ) : (
              <ul className="space-y-2">
                {entityData?.entities?.slice(0, 8).map((e) => (
                  <li key={e.id} className="border-b border-california-border/50 pb-2">
                    <span className="font-medium text-text-primary">{e.name}</span>
                    <span className="text-text-tertiary ml-1">({e.case_count} cases)</span>
                  </li>
                ))}
                {(!entityData?.entities || entityData.entities.length === 0) && (
                  <li className="text-text-tertiary">No multi-case entities in current data.</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
