'use client'

import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { useState, useRef } from 'react'
import { useFilterStore } from '@/stores/filters'
import { useSummary } from '@/hooks/useFraudData'
import { formatCurrency, formatNumber } from '@/lib/design-tokens'
import FilterChips from './FilterChips'
import RangeSliders from './RangeSliders'
import DatePicker from './DatePicker'

function MobileKPIBar() {
  const { data: summary, isLoading } = useSummary()

  if (isLoading || !summary) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 w-24 bg-california-border/30 rounded-lg animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  const kpis = [
    { label: 'Cases', value: formatNumber(summary.total_cases), color: 'bg-california-poppy' },
    { label: 'Exposed', value: formatCurrency(summary.total_exposed), color: 'bg-fraud-critical' },
    { label: 'Recovered', value: formatCurrency(summary.total_recovered), color: 'bg-california-redwood' },
    { label: 'Recovery', value: `${(summary.recovery_rate * 100).toFixed(1)}%`, color: 'bg-california-pacific' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="flex-shrink-0 bg-california-white rounded-xl p-3 shadow-card min-w-[100px] snap-start"
        >
          <div className={`w-6 h-1 ${kpi.color} rounded-full mb-1.5`} />
          <p className="text-[10px] text-text-secondary uppercase tracking-wide">{kpi.label}</p>
          <p className="text-sm font-bold text-text-primary truncate">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}

const CA_ADDRESS = '39wKUzueHdG2nHGGk7rAPNuFkwTVLr4xqECjF1uopump'

function MobileCopyCA() {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(CA_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="mt-0.5 flex items-center gap-1 group cursor-pointer text-left"
      title="Click to copy address"
    >
      <span className="text-[11px] text-text-tertiary font-mono break-all leading-snug select-all">
        ca: {CA_ADDRESS}
      </span>
      <span className="flex-shrink-0 text-text-tertiary group-hover:text-california-pacific transition-colors">
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6L9 17l-5-5"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        )}
      </span>
    </button>
  )
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const dragControls = useDragControls()
  const constraintsRef = useRef(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 100) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile top bar with KPIs */}
      <div className="fixed top-0 left-0 right-0 z-20 lg:hidden">
        {/* Header */}
        <div className="bg-california-white/95 backdrop-blur-md border-b border-california-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2.5 bg-california-sand rounded-xl active:scale-95 transition-transform"
                aria-label="Open filters"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-primary"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-text-primary">CaliFraud</h1>
                <p className="text-[10px] text-text-secondary -mt-0.5">Intelligence Platform</p>
                <MobileCopyCA />
              </div>
            </div>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                showStats ? 'bg-california-poppy text-white' : 'bg-california-sand text-text-primary'
              }`}
              aria-label="Toggle stats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible KPI bar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-california-sand/95 backdrop-blur-md overflow-hidden"
            >
              <MobileKPIBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            />

            {/* Panel with drag to close */}
            <motion.div
              ref={constraintsRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              className="fixed bottom-0 left-0 right-0 z-40 bg-california-white rounded-t-3xl
                shadow-2xl max-h-[85vh] overflow-hidden lg:hidden touch-none"
            >
              {/* Handle - drag area */}
              <div 
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 bg-california-border rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 flex items-center justify-between border-b border-california-border">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Filters</h2>
                  <p className="text-xs text-text-secondary">Refine your fraud search</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 hover:bg-california-sand rounded-xl transition-colors active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="overflow-y-auto max-h-[calc(85vh-120px)] overscroll-contain">
                <FilterChips />
                <div className="border-t border-california-border" />
                <RangeSliders />
                <DatePicker />
                
                {/* Bottom padding for safe area */}
                <div className="h-8" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
