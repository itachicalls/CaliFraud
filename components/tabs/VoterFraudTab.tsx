'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import {
  getVoterFraudYearly,
  getVoterFraudByCounty,
  getNotableCases,
  getVoterFraudSummary,
  getCategoryLabel,
  AUDIT_FINDINGS,
  type VoterFraudCategory,
  type NotableCase,
  type YearlySnapshot,
  VOTER_FRAUD_CATEGORIES,
} from '@/lib/voter-fraud-data'

/* ═══════════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════════ */

const YEARLY = getVoterFraudYearly()
const BY_COUNTY = getVoterFraudByCounty()
const NOTABLE = getNotableCases()
const SUMMARY = getVoterFraudSummary()

const CAT_CLR: Record<VoterFraudCategory, string> = {
  registration_fraud: '#1E6FFF',
  ineligible_voting: '#D72638',
  double_voting: '#FF7A18',
  ballot_petition_fraud: '#F6B400',
  absentee_ballot_fraud: '#FF7A18',
  false_candidacy: '#8B5CF6',
  other: '#8A8A8A',
}

const SEVERITY_CLR: Record<string, string> = {
  low: '#6B7280',
  medium: '#F6B400',
  high: '#FF7A18',
  critical: '#D72638',
}

const SEVERITY_LABEL: Record<string, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
}

/* ═══════════════════════════════════════════════════════════════
   Carousel slide types — every single piece of data becomes a slide
   ═══════════════════════════════════════════════════════════════ */

interface Slide {
  id: string
  render: () => React.ReactNode
}

function AnimCounter({ to, duration = 1.8, prefix = '', suffix = '', className = '' }: { to: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctrl = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`
      },
    })
    return () => ctrl.stop()
  }, [to, duration, prefix, suffix])
  return <span ref={ref} className={className}>{prefix}0{suffix}</span>
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(246,180,0,0.25), transparent)' }}
      initial={{ top: 0, opacity: 0 }}
      animate={{ top: ['0%', '100%'], opacity: [0, 0.6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 z-0"
        style={{ color: '#D72638', clipPath: 'inset(0 0 0 0)' }}
        animate={{
          clipPath: [
            'inset(0% 0% 100% 0%)',
            'inset(40% 0% 50% 0%)',
            'inset(0% 0% 100% 0%)',
            'inset(60% 0% 30% 0%)',
            'inset(0% 0% 100% 0%)',
          ],
          x: [0, -2, 0, 2, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
      >
        {text}
      </motion.span>
    </span>
  )
}

function buildSlides(): Slide[] {
  const slides: Slide[] = []

  // ── SLIDE 0: BOOT SCREEN ──
  slides.push({
    id: 'boot',
    render: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ScanLine />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(246,180,0,0.4) 0%, rgba(246,180,0,0.05) 70%)', border: '2px solid rgba(246,180,0,0.5)' }}
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="#F6B400" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.7, 1] }}
          transition={{ duration: 2 }}
          className="text-[10px] uppercase tracking-[0.35em] mb-2"
          style={{ color: 'rgba(246,180,0,0.6)' }}
        >
          California Election Integrity Monitor
        </motion.p>
        <GlitchText
          text="VOTER FRAUD DATABASE"
          className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/50 text-sm mb-8"
        >
          {SUMMARY.yearRange[0]}–{SUMMARY.yearRange[1]} · Public records & court filings
        </motion.p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {[
            { v: SUMMARY.totalReferrals, label: 'REFERRALS', c: '#F6B400' },
            { v: SUMMARY.totalCharged, label: 'CHARGED', c: '#FF7A18' },
            { v: SUMMARY.totalConvicted, label: 'CONVICTED', c: '#D72638' },
          ].map(({ v, label, c }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-xl p-3 text-center"
              style={{ background: `${c}15`, border: `1px solid ${c}30` }}
            >
              <AnimCounter to={v} className="text-2xl font-black tabular-nums block" prefix="" />
              <p className="text-[9px] uppercase tracking-widest mt-1" style={{ color: `${c}cc` }}>{label}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="text-white/30 text-xs mt-6 uppercase tracking-widest"
        >
          Swipe to begin →
        </motion.p>
      </div>
    ),
  })

  // ── YEARLY SLIDES ──
  const maxRef = Math.max(...YEARLY.map((y) => y.referrals), 1)
  const maxConv = Math.max(...YEARLY.map((y) => y.convicted), 1)
  YEARLY.forEach((yr) => {
    slides.push({
      id: `yr-${yr.year}`,
      render: () => (
        <div className="w-full h-full flex flex-col p-5 relative overflow-hidden">
          <ScanLine />
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-black tabular-nums text-white">{yr.year}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30">Annual Report</span>
          </div>
          <div className="h-px w-full mb-4" style={{ background: 'linear-gradient(90deg, #F6B400, transparent)' }} />
          <div className="space-y-3 flex-1">
            {[
              { label: 'Referrals', val: yr.referrals, max: maxRef, clr: '#F6B400', grad: 'linear-gradient(90deg, #F6B400, #FF7A18)' },
              { label: 'Investigations', val: yr.investigations, max: maxRef, clr: '#1E6FFF', grad: 'linear-gradient(90deg, #1E6FFF, #4d94ff)' },
              { label: 'Charged', val: yr.charged, max: 14, clr: '#FF7A18', grad: 'linear-gradient(90deg, #FF7A18, #D72638)' },
              { label: 'Convicted', val: yr.convicted, max: maxConv, clr: '#D72638', grad: 'linear-gradient(90deg, #D72638, #ff4d6a)' },
            ].map(({ label, val, max, clr, grad }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60 uppercase tracking-wider">{label}</span>
                  <span className="font-bold tabular-nums" style={{ color: clr }}>{val}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((val / max) * 100, 2)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: grad }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-3">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">Breakdown</p>
            <div className="flex flex-wrap gap-1.5">
              {VOTER_FRAUD_CATEGORIES.filter((c) => yr.byCategory[c] > 0).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ background: `${CAT_CLR[cat]}20`, color: CAT_CLR[cat] }}
                >
                  {getCategoryLabel(cat)}: {yr.byCategory[cat]}
                </span>
              ))}
              {VOTER_FRAUD_CATEGORIES.every((c) => yr.byCategory[c] === 0) && (
                <span className="text-[10px] text-white/30">No convictions yet</span>
              )}
            </div>
          </div>
        </div>
      ),
    })
  })

  // ── COUNTY SLIDE ──
  const topCounties = BY_COUNTY.filter((c) => c.county !== 'Other').slice(0, 10)
  const maxCountyRef = Math.max(...topCounties.map((c) => c.referrals), 1)
  slides.push({
    id: 'counties',
    render: () => (
      <div className="w-full h-full flex flex-col p-5 relative overflow-hidden">
        <ScanLine />
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-xl font-black text-white">County Breakdown</span>
        </div>
        <div className="h-px w-full mb-4" style={{ background: 'linear-gradient(90deg, #2E5E4E, transparent)' }} />
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {topCounties.map((c, i) => (
            <motion.div
              key={c.county}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-white/80 font-medium">{c.county}</span>
                <span className="text-white/40 tabular-nums">{c.referrals} ref · <span style={{ color: '#D72638' }}>{c.convicted}</span> conv</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.referrals / maxCountyRef) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #2E5E4E, #4d9b7e)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  })

  // ── CATEGORY SLIDE ──
  const catTotals = VOTER_FRAUD_CATEGORIES.reduce(
    (acc, cat) => { acc[cat] = YEARLY.reduce((s, y) => s + (y.byCategory[cat] ?? 0), 0); return acc },
    {} as Record<VoterFraudCategory, number>
  )
  const maxCat = Math.max(...Object.values(catTotals), 1)
  slides.push({
    id: 'categories',
    render: () => (
      <div className="w-full h-full flex flex-col p-5 relative overflow-hidden">
        <ScanLine />
        <span className="text-xl font-black text-white mb-1">Fraud Types</span>
        <p className="text-white/40 text-[11px] mb-4">Convictions by category across all years</p>
        <div className="space-y-3 flex-1">
          {VOTER_FRAUD_CATEGORIES.map((cat, i) => {
            const v = catTotals[cat]
            return (
              <div key={cat}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-white/70">{getCategoryLabel(cat)}</span>
                  <span className="font-bold tabular-nums" style={{ color: CAT_CLR[cat] }}>{v}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((v / maxCat) * 100, v > 0 ? 4 : 0)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: CAT_CLR[cat] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    ),
  })

  // ── EVERY NOTABLE CASE ──
  NOTABLE.forEach((c, ci) => {
    const sevClr = SEVERITY_CLR[c.severity] || SEVERITY_CLR.medium
    const sevLabel = SEVERITY_LABEL[c.severity] || 'MEDIUM'
    slides.push({
      id: c.id,
      render: () => (
        <div className="w-full h-full flex flex-col p-5 relative overflow-hidden">
          <ScanLine />
          {/* Header row: category + severity + case # */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${CAT_CLR[c.category]}25`, color: CAT_CLR[c.category] }}
            >
              {getCategoryLabel(c.category)}
            </span>
            <span
              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
              style={{ background: `${sevClr}20`, color: sevClr, border: `1px solid ${sevClr}30` }}
            >
              {sevLabel}
            </span>
            <span className="text-white/30 text-[10px] ml-auto font-mono">#{String(ci + 1).padStart(3, '0')}</span>
          </div>
          <p className="text-white/50 text-xs">{c.year} · {c.county} County</p>
          <h3 className="text-base font-bold text-white mt-1 mb-2 leading-snug">{c.title}</h3>
          <div className="h-px w-full mb-2" style={{ background: `linear-gradient(90deg, ${CAT_CLR[c.category]}40, transparent)` }} />
          <p className="text-white/70 text-[13px] leading-relaxed flex-1 overflow-y-auto">{c.summary}</p>
          <div className="mt-auto pt-3 space-y-2">
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(246,180,0,0.08)', border: '1px solid rgba(246,180,0,0.15)' }}>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-0.5">Outcome</p>
              <p className="text-sm font-semibold" style={{ color: '#F6B400' }}>{c.outcome}</p>
            </div>
            {c.source && (
              <p className="text-[10px] text-white/20 font-mono truncate">Source: {c.source}</p>
            )}
          </div>
        </div>
      ),
    })
  })

  // ── AUDIT FINDINGS ──
  slides.push({
    id: 'audit',
    render: () => (
      <div className="w-full h-full flex flex-col p-5 relative overflow-hidden">
        <ScanLine />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-1"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-red-400/80">Critical Finding</span>
        </motion.div>
        <span className="text-xl font-black text-white mb-1">2023 Audit Report</span>
        <p className="text-white/40 text-[11px] mb-4">Transparency Foundation · CA election integrity</p>
        <div className="space-y-2.5 flex-1 overflow-y-auto">
          <div className="rounded-xl p-3" style={{ background: 'rgba(215,38,56,0.12)', border: '1px solid rgba(215,38,56,0.25)' }}>
            <p className="text-2xl font-black" style={{ color: '#D72638' }}>{AUDIT_FINDINGS.fraudRateSample}%</p>
            <p className="text-white/60 text-xs mt-1">Likely fraud rate in sample of {AUDIT_FINDINGS.sampleSize} rejected, uncured ballots</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,122,24,0.1)', border: '1px solid rgba(255,122,24,0.2)' }}>
            <p className="text-2xl font-black text-white">{AUDIT_FINDINGS.uncuredSignatures}%</p>
            <p className="text-white/60 text-xs mt-1">Rejected signatures that remained uncured</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(246,180,0,0.1)', border: '1px solid rgba(246,180,0,0.2)' }}>
            <p className="text-2xl font-black" style={{ color: '#F6B400' }}>6.6M</p>
            <p className="text-white/60 text-xs mt-1">People moved out of CA since 2010, still on voter rolls</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(30,111,255,0.1)', border: '1px solid rgba(30,111,255,0.2)' }}>
            <p className="text-lg font-black text-white">{AUDIT_FINDINGS.signatureRejectionLow.rate}% → {AUDIT_FINDINGS.signatureRejectionHigh.rate}%</p>
            <p className="text-white/60 text-xs mt-1">Signature rejection disparity: {AUDIT_FINDINGS.signatureRejectionLow.county} vs {AUDIT_FINDINGS.signatureRejectionHigh.county}</p>
          </div>
        </div>
      </div>
    ),
  })

  // ── END CARD ──
  slides.push({
    id: 'end',
    render: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
        <ScanLine />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">Database Complete</p>
          <p className="text-3xl font-black text-white">
            <AnimCounter to={NOTABLE.length} duration={1} /> Cases Documented
          </p>
        </motion.div>
        <div className="h-px w-32 my-4" style={{ background: 'linear-gradient(90deg, transparent, #F6B400, transparent)' }} />
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          Sources: CA Secretary of State, county district attorneys, Heritage Foundation Election Fraud Database, court records.
        </p>
        <motion.p
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/20 text-xs mt-6 uppercase tracking-widest"
        >
          ← Swipe to review
        </motion.p>
      </div>
    ),
  })

  return slides
}

const SLIDES = buildSlides()

/* ═══════════════════════════════════════════════════════════════
   Carousel
   ═══════════════════════════════════════════════════════════════ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function VoterFraudTab() {
  const [active, setActive] = useState(0)
  const dragX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const mobile = useIsMobile()

  const goTo = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(i, SLIDES.length - 1)))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(active - 1)
      if (e.key === 'ArrowRight') goTo(active + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, goTo])

  // Wheel support (desktop)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let lastWheel = 0
    const onWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastWheel < 400) return
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
        lastWheel = now
        if (e.deltaX > 0) goTo(active + 1)
        else goTo(active - 1)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [active, goTo])

  // Responsive card dimensions
  const CARD_W = mobile ? Math.min(300, typeof window !== 'undefined' ? window.innerWidth - 48 : 300) : 360
  const CARD_H = mobile ? 380 : 440
  const GAP = mobile ? 16 : 28
  const SWIPE_THRESHOLD = mobile ? 40 : 60

  const progress = SLIDES.length > 1 ? active / (SLIDES.length - 1) : 0

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden flex flex-col select-none"
      style={{
        background: 'linear-gradient(165deg, #0a1a14 0%, #060e0a 40%, #040806 100%)',
      }}
    >
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 60% 40% at 15% 15%, rgba(30,111,255,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 50% 35% at 85% 75%, rgba(246,180,0,0.04) 0%, transparent 50%),
          radial-gradient(ellipse 40% 25% at 50% 5%, rgba(215,38,56,0.04) 0%, transparent 50%)
        `,
      }} />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(246,180,0,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(246,180,0,0.3) 1px, transparent 1px)
          `,
          backgroundSize: mobile ? '40px 40px' : '60px 60px',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(4,8,6,0.6) 100%)',
      }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-between px-4 py-2 md:px-5 md:py-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D72638', boxShadow: '0 0 8px rgba(215,38,56,0.5)' }} />
          <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-white/60">Voter Fraud Intel</span>
        </div>
        <span className="text-white/30 text-[10px] md:text-xs tabular-nums font-mono">
          {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="relative z-10 flex-shrink-0 px-4 md:px-5">
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F6B400, #FF7A18, #D72638)' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* ── Carousel ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative flex items-center justify-center w-full"
          style={{ perspective: mobile ? 800 : 1400, minHeight: CARD_H }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDrag={(_, info) => dragX.set(info.offset.x)}
          onDragEnd={(_, info) => {
            dragX.set(0)
            if (info.offset.x > SWIPE_THRESHOLD) goTo(active - 1)
            else if (info.offset.x < -SWIPE_THRESHOLD) goTo(active + 1)
          }}
        >
          <AnimatePresence initial={false}>
            {SLIDES.map((slide, i) => {
              const dist = i - active
              const maxVisible = mobile ? 2 : 3
              if (Math.abs(dist) > maxVisible) return null

              const x = dist * (CARD_W + GAP)
              const sc = Math.max(0.65, 1 - Math.abs(dist) * (mobile ? 0.2 : 0.15))
              const op = Math.max(0, 1 - Math.abs(dist) * (mobile ? 0.5 : 0.35))
              const ry = mobile ? 0 : Math.max(-15, Math.min(15, -dist * 10))
              const z = 100 - Math.abs(dist)
              const blur = Math.abs(dist) > 1 ? (mobile ? 3 : 2) : 0
              const isActive = dist === 0

              return (
                <motion.div
                  key={slide.id}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x,
                    scale: sc,
                    opacity: op,
                    rotateY: ry,
                    filter: `blur(${blur}px)`,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: mobile ? 0.35 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    left: '50%',
                    marginLeft: -CARD_W / 2,
                    zIndex: Math.round(z),
                    transformStyle: 'preserve-3d',
                    touchAction: 'pan-y',
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                  onClick={() => !isActive && goTo(i)}
                >
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden relative"
                    style={{
                      background: isActive
                        ? 'linear-gradient(170deg, rgba(20,40,30,0.97) 0%, rgba(8,16,12,0.99) 100%)'
                        : 'linear-gradient(170deg, rgba(15,28,22,0.9) 0%, rgba(6,12,9,0.95) 100%)',
                      border: isActive
                        ? '1.5px solid rgba(246,180,0,0.4)'
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isActive
                        ? '0 0 40px rgba(246,180,0,0.08), 0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(246,180,0,0.1)'
                        : '0 10px 30px -10px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Corner accents for active card */}
                    {isActive && (
                      <>
                        <div className="absolute top-0 left-0 w-5 h-5 md:w-6 md:h-6 pointer-events-none">
                          <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'rgba(246,180,0,0.5)' }} />
                          <div className="absolute top-0 left-0 w-px h-full" style={{ background: 'rgba(246,180,0,0.5)' }} />
                        </div>
                        <div className="absolute top-0 right-0 w-5 h-5 md:w-6 md:h-6 pointer-events-none">
                          <div className="absolute top-0 right-0 w-full h-px" style={{ background: 'rgba(246,180,0,0.5)' }} />
                          <div className="absolute top-0 right-0 w-px h-full" style={{ background: 'rgba(246,180,0,0.5)' }} />
                        </div>
                        <div className="absolute bottom-0 left-0 w-5 h-5 md:w-6 md:h-6 pointer-events-none">
                          <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'rgba(246,180,0,0.5)' }} />
                          <div className="absolute bottom-0 left-0 w-px h-full" style={{ background: 'rgba(246,180,0,0.5)' }} />
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 pointer-events-none">
                          <div className="absolute bottom-0 right-0 w-full h-px" style={{ background: 'rgba(246,180,0,0.5)' }} />
                          <div className="absolute bottom-0 right-0 w-px h-full" style={{ background: 'rgba(246,180,0,0.5)' }} />
                        </div>
                      </>
                    )}
                    {slide.render()}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Navigation ── */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center gap-3 md:gap-5 py-2 md:py-3">
        <button
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(246,180,0,0.15)',
            border: '1px solid rgba(246,180,0,0.3)',
            color: '#F6B400',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        {/* Dot indicators - compact on mobile */}
        <div className="flex items-center gap-[3px] md:gap-1 max-w-[200px] md:max-w-none overflow-hidden">
          {SLIDES.map((_, i) => {
            const isCurrent = i === active
            const nearActive = Math.abs(i - active) <= (mobile ? 6 : 999)
            if (mobile && !nearActive) return null
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all flex-shrink-0"
                style={{
                  width: isCurrent ? (mobile ? 12 : 16) : (mobile ? 3 : 4),
                  height: mobile ? 3 : 4,
                  borderRadius: 2,
                  background: isCurrent
                    ? 'linear-gradient(90deg, #F6B400, #FF7A18)'
                    : i < active ? 'rgba(246,180,0,0.3)' : 'rgba(255,255,255,0.15)',
                }}
              />
            )
          })}
        </div>

        <button
          onClick={() => goTo(active + 1)}
          disabled={active === SLIDES.length - 1}
          className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(246,180,0,0.15)',
            border: '1px solid rgba(246,180,0,0.3)',
            color: '#F6B400',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-2 md:px-5 md:pb-3">
        <p className="text-white/20 text-[9px] md:text-[10px] text-center font-mono">
          CA SOS · County DAs · Heritage Foundation · Court Records · {SUMMARY.yearRange[0]}–{SUMMARY.yearRange[1]}
        </p>
      </div>
    </div>
  )
}
