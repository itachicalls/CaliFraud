'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getVoterFraudYearly,
  getVoterFraudByCounty,
  getNotableCases,
  getVoterFraudSummary,
  getCategoryLabel,
  type VoterFraudCategory,
  VOTER_FRAUD_CATEGORIES,
} from '@/lib/voter-fraud-data'
import Card from '@/components/ui/Card'
import { colors } from '@/lib/design-tokens'

const YEARLY = getVoterFraudYearly()
const BY_COUNTY = getVoterFraudByCounty()
const SUMMARY = getVoterFraudSummary()

const CATEGORY_COLORS: Record<VoterFraudCategory, string> = {
  registration_fraud: colors.california.pacific,
  ineligible_voting: colors.fraud.critical,
  double_voting: colors.california.sunset,
  ballot_petition_fraud: colors.california.poppy,
  absentee_ballot_fraud: colors.fraud.high,
  other: colors.text.tertiary,
}

function AnimBar({ value, max, color, label, delay = 0 }: { value: number; max: number; color: string; label?: string; delay?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2 min-w-0 group">
      {label != null && (
        <span className="text-sm text-text-secondary truncate w-24 flex-shrink-0" title={label}>
          {label}
        </span>
      )}
      <div className="flex-1 min-w-0 h-6 rounded-md overflow-hidden bg-california-border/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
          className="h-full rounded-md"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-medium text-text-primary tabular-nums w-10 text-right flex-shrink-0">{value}</span>
    </div>
  )
}

export default function VoterFraudTab() {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  const [view, setView] = useState<'timeline' | 'county' | 'category'>('timeline')

  const filteredYearly = useMemo(() => {
    if (selectedYear === 'all') return YEARLY
    return YEARLY.filter((y) => y.year === selectedYear)
  }, [selectedYear])

  const notableCases = useMemo(() => {
    if (selectedYear === 'all') return getNotableCases()
    return getNotableCases({ year: selectedYear })
  }, [selectedYear])

  const maxReferrals = Math.max(...YEARLY.map((y) => y.referrals), 1)
  const maxConvicted = Math.max(...YEARLY.map((y) => y.convicted), 1)
  const maxCountyReferrals = Math.max(...BY_COUNTY.map((c) => c.referrals), 1)

  const categoryTotals = useMemo(() => {
    const tot: Record<VoterFraudCategory, number> = {
      registration_fraud: 0,
      ineligible_voting: 0,
      double_voting: 0,
      ballot_petition_fraud: 0,
      absentee_ballot_fraud: 0,
      other: 0,
    }
    YEARLY.forEach((y) => {
      (VOTER_FRAUD_CATEGORIES as VoterFraudCategory[]).forEach((c) => {
        tot[c] += y.byCategory[c] ?? 0
      })
    })
    return tot
  }, [])
  const maxCategory = Math.max(...Object.values(categoryTotals), 1)

  return (
    <div className="h-full overflow-y-auto bg-california-sand">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-12">
        {/* Hero + KPIs */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
            Voter fraud in California
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Referrals, investigations, and convictions from COVID (2020) through present. Data from public records and election officials.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <Card className="p-4" hover>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Total referrals</p>
              <motion.p
                className="text-xl md:text-2xl font-bold text-california-poppy tabular-nums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {SUMMARY.totalReferrals.toLocaleString()}
              </motion.p>
            </Card>
            <Card className="p-4" hover>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Charged</p>
              <motion.p
                className="text-xl md:text-2xl font-bold text-text-primary tabular-nums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                {SUMMARY.totalCharged}
              </motion.p>
            </Card>
            <Card className="p-4" hover>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Convicted</p>
              <motion.p
                className="text-xl md:text-2xl font-bold text-fraud-critical tabular-nums"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {SUMMARY.totalConvicted}
              </motion.p>
            </Card>
            <Card className="p-4" hover>
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Years</p>
              <motion.p
                className="text-xl md:text-2xl font-bold text-text-primary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              >
                {SUMMARY.yearRange[0]}–{SUMMARY.yearRange[1]}
              </motion.p>
            </Card>
          </div>
        </motion.section>

        {/* Year filter + view toggle */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="text-sm font-medium text-text-secondary">Year:</span>
          <div className="flex flex-wrap gap-1.5">
            {['all', ...YEARLY.map((y) => y.year)].map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y as number | 'all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedYear === y
                    ? 'bg-california-poppy text-white'
                    : 'bg-california-white border border-california-border text-text-secondary hover:bg-california-sand'
                }`}
              >
                {y === 'all' ? 'All' : y}
              </button>
            ))}
          </div>
          <span className="text-text-tertiary mx-2">|</span>
          <span className="text-sm font-medium text-text-secondary">View:</span>
          <div className="flex gap-1">
            {(['timeline', 'county', 'category'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-california-redwood text-white' : 'bg-california-white border border-california-border text-text-secondary hover:bg-california-sand'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Charts */}
        <AnimatePresence mode="wait">
          {view === 'timeline' && (
            <motion.section
              key="timeline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 md:p-6" variant="elevated">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Referrals & convictions by year</h2>
                <div className="space-y-5">
                  {filteredYearly.map((y, i) => (
                    <div key={y.year} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{y.year}</span>
                        <span className="text-sm text-text-secondary">
                          {y.referrals} referrals → {y.charged} charged → <span className="text-fraud-critical font-medium">{y.convicted} convicted</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                        <span className="text-xs text-text-tertiary w-16">Referrals</span>
                        <div className="h-7 rounded-md overflow-hidden bg-california-border/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(y.referrals / maxReferrals) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="h-full bg-california-poppy/90 rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium tabular-nums w-10 text-right">{y.referrals}</span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                        <span className="text-xs text-text-tertiary w-16">Convicted</span>
                        <div className="h-5 rounded-md overflow-hidden bg-california-border/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(y.convicted / maxConvicted) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.08 + 0.1 }}
                            className="h-full bg-fraud-critical rounded-md"
                          />
                        </div>
                        <span className="text-sm font-medium tabular-nums w-10 text-right text-fraud-critical">{y.convicted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.section>
          )}

          {view === 'county' && (
            <motion.section
              key="county"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 md:p-6" variant="elevated">
                <h2 className="text-lg font-semibold text-text-primary mb-4">By county (referrals & convictions)</h2>
                <p className="text-sm text-text-secondary mb-4">Hover to highlight. Referrals are allegations; convicted are criminal convictions.</p>
                <div className="space-y-3">
                  {BY_COUNTY.map((c, i) => (
                    <div
                      key={c.county}
                      onMouseEnter={() => setHoveredCounty(c.county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      className={`transition-opacity ${hoveredCounty != null && hoveredCounty !== c.county ? 'opacity-50' : ''}`}
                    >
                      <AnimBar
                        value={c.referrals}
                        max={maxCountyReferrals}
                        color={c.county === hoveredCounty ? colors.california.pacific : colors.california.poppy}
                        label={c.county}
                        delay={i * 0.03}
                      />
                      <div className="flex justify-end gap-4 mt-0.5 text-xs text-text-tertiary">
                        <span>{c.convicted} convicted</span>
                        {c.notableCases > 0 && <span>{c.notableCases} notable case{c.notableCases !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.section>
          )}

          {view === 'category' && (
            <motion.section
              key="category"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 md:p-6" variant="elevated">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Convictions by fraud type (all years)</h2>
                <div className="space-y-3">
                  {(VOTER_FRAUD_CATEGORIES as VoterFraudCategory[]).map((cat, i) => (
                    <AnimBar
                      key={cat}
                      value={categoryTotals[cat]}
                      max={maxCategory}
                      color={CATEGORY_COLORS[cat]}
                      label={getCategoryLabel(cat)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Notable cases */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 md:p-6" variant="elevated">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Notable cases</h2>
            <p className="text-sm text-text-secondary mb-4">
              {selectedYear === 'all' ? 'All years' : `Year ${selectedYear}`}. Click to expand.
            </p>
            <div className="space-y-2">
              <AnimatePresence>
                {notableCases.length === 0 ? (
                  <p className="text-text-tertiary text-sm py-4">No notable cases in this selection.</p>
                ) : (
                  notableCases.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border border-california-border rounded-lg overflow-hidden bg-california-white"
                    >
                      <button
                        onClick={() => setExpandedCaseId(expandedCaseId === c.id ? null : c.id)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-california-sand/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-text-tertiary mr-2">{c.year} · {c.county}</span>
                          <span className="font-medium text-text-primary block truncate">{c.title}</span>
                        </div>
                        <span
                          className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[c.category]}20`,
                            color: CATEGORY_COLORS[c.category],
                          }}
                        >
                          {getCategoryLabel(c.category)}
                        </span>
                        <span className="flex-shrink-0 text-text-tertiary text-lg">{expandedCaseId === c.id ? '−' : '+'}</span>
                      </button>
                      <AnimatePresence>
                        {expandedCaseId === c.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-california-border/50">
                              <p className="text-sm text-text-secondary mt-3">{c.summary}</p>
                              <p className="text-sm font-medium text-text-primary mt-2">Outcome: {c.outcome}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.section>

        {/* Sources */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-text-tertiary border-t border-california-border pt-4"
        >
          <p>
            Data reflects public referrals, investigations, and convictions. Sources include California Secretary of State election reports,
            county district attorneys, and documented court outcomes. Numbers are illustrative of reported activity from 2020 through present.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
