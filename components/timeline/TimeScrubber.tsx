'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeline } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'
import { formatCurrency } from '@/lib/design-tokens'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TimeScrubber() {
  const [collapsed, setCollapsed] = useState(false)
  const { data: timeline, isLoading } = useTimeline()
  const currentPeriod = useFilterStore((state) => state.currentPeriod)
  const setCurrentPeriod = useFilterStore((state) => state.setCurrentPeriod)
  const isPlaying = useFilterStore((state) => state.isPlaying)
  const setIsPlaying = useFilterStore((state) => state.setIsPlaying)
  const setDateRange = useFilterStore((state) => state.setDateRange)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIndexRef = useRef(0)

  // Find current data point
  const currentData = timeline?.find((t) => t.period === currentPeriod)

  // Handle period selection
  const handlePeriodSelect = useCallback(
    (period: string) => {
      setCurrentPeriod(period)
      setIsPlaying(false)

      // Update date range filter to match selected month
      const [year, month] = period.split('-').map(Number)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
      setDateRange(startDate, endDate)
    },
    [setCurrentPeriod, setIsPlaying, setDateRange]
  )

  // Play animation
  const startPlayback = useCallback(() => {
    if (!timeline || timeline.length === 0) return

    setIsPlaying(true)
    currentIndexRef.current = currentPeriod
      ? timeline.findIndex((t) => t.period === currentPeriod)
      : 0

    if (currentIndexRef.current === -1 || currentIndexRef.current >= timeline.length - 1) {
      currentIndexRef.current = 0
    }

    intervalRef.current = setInterval(() => {
      currentIndexRef.current++

      if (currentIndexRef.current >= timeline.length) {
        currentIndexRef.current = 0
        setIsPlaying(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        return
      }

      const period = timeline[currentIndexRef.current].period
      setCurrentPeriod(period)

      // Update date range
      const [year, month] = period.split('-').map(Number)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
      setDateRange(startDate, endDate)
    }, 1800)  // 1.8 seconds per month for comfortable viewing
  }, [timeline, currentPeriod, setCurrentPeriod, setIsPlaying, setDateRange])

  // Stop playback
  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [setIsPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Reset to all time
  const resetToAllTime = useCallback(() => {
    setCurrentPeriod(null)
    setDateRange(null, null)
    stopPlayback()
  }, [setCurrentPeriod, setDateRange, stopPlayback])

  if (isLoading || !timeline || timeline.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-card h-20 animate-pulse" />
        </div>
      </div>
    )
  }

  // Get max value for scaling
  const maxExposed = Math.max(...timeline.map((t) => t.total_exposed))

  // Calculate cumulative totals
  const cumulativeData = timeline.reduce((acc, point, index) => {
    const prevTotal = index > 0 ? acc[index - 1].cumulative : 0
    acc.push({
      ...point,
      cumulative: prevTotal + point.total_exposed,
    })
    return acc
  }, [] as Array<typeof timeline[0] & { cumulative: number }>)

  const totalFraud = cumulativeData[cumulativeData.length - 1]?.cumulative || 0

  // Get current cumulative amount based on selected period
  const currentIndex = currentPeriod 
    ? cumulativeData.findIndex((t) => t.period === currentPeriod)
    : cumulativeData.length - 1
  const currentCumulative = currentIndex >= 0 ? cumulativeData[currentIndex].cumulative : totalFraud
  const cumulativePercent = (currentCumulative / totalFraud) * 100

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-4"
      role="region"
      aria-label="Time navigation"
    >
      <div className="max-w-4xl mx-auto lg:ml-80">
        <div className="glass rounded-card shadow-panel overflow-hidden">
          {/* Collapsed header - always visible */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors text-left"
            aria-expanded={!collapsed}
          >
            <div className="flex items-center gap-3">
              <span className="text-california-poppy">
                {collapsed ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                )}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); isPlaying ? stopPlayback() : startPlayback() }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-california-poppy text-white shadow-md hover:bg-california-sunset transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  CaliFraud Timelapse
                </p>
                <p className="text-xs text-text-secondary">
                  {currentPeriod
                    ? `${MONTHS[parseInt(currentPeriod.split('-')[1]) - 1]} ${currentPeriod.split('-')[0]} • ${formatCurrency(currentData?.total_exposed ?? 0)}`
                    : `2020 – 2026 • ${timeline.reduce((sum, t) => sum + t.case_count, 0).toLocaleString()} cases • ${formatCurrency(totalFraud)}`}
                </p>
              </div>
            </div>
            {collapsed && (
              <span className="text-xs text-text-tertiary">Click to expand</span>
            )}
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-white/30"
              >
                <div className="p-4 pt-3">
          {/* Timelapse instruction - show when idle */}
          {!isPlaying && !currentPeriod && (
            <p className="text-xs text-text-secondary mb-2 text-center">
              <span className="font-medium text-california-poppy">CaliFraud Timelapse:</span>{' '}
              Press play to see how the total fraud in California has accumulated over time
            </p>
          )}

          {/* Reset button - only show when a period is selected */}
          <div className="flex justify-end mb-3">
            {currentPeriod && (
              <button
                onClick={resetToAllTime}
                className="text-xs text-text-secondary hover:text-california-poppy transition-colors"
              >
                Show All
              </button>
            )}
          </div>

          {/* Cumulative Fraud Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-secondary">
                Total Fraud Accumulated
              </span>
              <motion.span 
                key={currentCumulative}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-bold text-california-red"
              >
                {formatCurrency(currentCumulative)}
              </motion.span>
            </div>
            <div className="h-3 bg-california-sand rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cumulativePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, 
                    #F6B400 0%, 
                    #FF7A18 50%, 
                    #D72638 100%)`
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-tertiary">$0</span>
              <span className="text-[10px] text-text-tertiary">{formatCurrency(totalFraud)}</span>
            </div>
          </div>

          {/* Timeline bar chart */}
          <div className="flex items-end gap-0.5 h-12">
            {timeline.map((point, index) => {
              const height = (point.total_exposed / maxExposed) * 100
              const isSelected = point.period === currentPeriod
              const isPast =
                currentPeriod &&
                timeline.findIndex((t) => t.period === currentPeriod) > index

              return (
                <button
                  key={point.period}
                  onClick={() => handlePeriodSelect(point.period)}
                  className="flex-1 relative group"
                  title={`${MONTHS[point.month - 1]} ${point.year}: ${formatCurrency(point.total_exposed)}`}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ duration: 0.3, delay: index * 0.01 }}
                    className={`w-full rounded-t transition-colors ${
                      isSelected
                        ? 'bg-california-poppy'
                        : isPast
                        ? 'bg-california-poppy/40'
                        : 'bg-california-border hover:bg-california-poppy/60'
                    }`}
                  />

                  {/* Tooltip on hover */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                    opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    <div className="bg-text-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {MONTHS[point.month - 1]} {point.year}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Year labels */}
          <div className="flex justify-between mt-2 px-1">
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
              <span key={year} className="text-xs text-text-tertiary">
                {year}
              </span>
            ))}
          </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
