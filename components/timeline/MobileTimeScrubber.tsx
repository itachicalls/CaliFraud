'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeline } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'
import { formatCurrency } from '@/lib/design-tokens'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MobileTimeScrubber() {
  const { data: timeline, isLoading } = useTimeline()
  const currentPeriod = useFilterStore((state) => state.currentPeriod)
  const setCurrentPeriod = useFilterStore((state) => state.setCurrentPeriod)
  const isPlaying = useFilterStore((state) => state.isPlaying)
  const setIsPlaying = useFilterStore((state) => state.setIsPlaying)
  const setDateRange = useFilterStore((state) => state.setDateRange)
  
  const [isExpanded, setIsExpanded] = useState(false)

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
    setIsExpanded(true)
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
    }, 1800)
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
      <div className="fixed bottom-0 left-0 right-0 z-10 p-3 safe-area-bottom">
        <div className="glass rounded-2xl h-16 animate-pulse" />
      </div>
    )
  }

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
  const totalCases = timeline.reduce((sum, t) => sum + t.case_count, 0)

  // Get current cumulative amount
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
      className="fixed bottom-0 left-0 right-0 z-10 p-3 pb-safe"
      role="region"
      aria-label="Time navigation"
    >
      <div className="glass rounded-2xl shadow-panel overflow-hidden">
        {/* Collapsed View - Always visible */}
        <div 
          className="p-3"
          onClick={() => !isPlaying && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            {/* Play/Pause button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                isPlaying ? stopPlayback() : startPlayback()
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full
                bg-california-poppy text-white shadow-lg
                active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Current info */}
            <div className="flex-1 min-w-0">
              {currentPeriod ? (
                <>
                  <p className="text-sm font-bold text-text-primary">
                    {MONTHS[parseInt(currentPeriod.split('-')[1]) - 1]}{' '}
                    {currentPeriod.split('-')[0]}
                  </p>
                  {currentData && (
                    <p className="text-xs text-text-secondary truncate">
                      {currentData.case_count.toLocaleString()} cases • {formatCurrency(currentData.total_exposed)}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-text-primary">All Time (2020–2026)</p>
                  <p className="text-xs text-text-secondary truncate">
                    {totalCases.toLocaleString()} cases • {formatCurrency(totalFraud)}
                  </p>
                </>
              )}
            </div>

            {/* Expand/Reset button */}
            {currentPeriod ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetToAllTime()
                }}
                className="p-2 text-text-secondary active:scale-95"
                aria-label="Reset to all time"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="p-2 text-text-secondary active:scale-95"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <motion.svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                >
                  <path d="M18 15l-6-6-6 6" />
                </motion.svg>
              </button>
            )}
          </div>

          {/* Progress bar - always visible */}
          <div className="mt-3 h-2 bg-california-sand rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cumulativePercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, #F6B400 0%, #FF7A18 50%, #D72638 100%)`
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-text-tertiary">$0</span>
            <span className="text-[9px] text-text-tertiary font-medium text-california-sunset">
              {formatCurrency(currentCumulative)}
            </span>
            <span className="text-[9px] text-text-tertiary">{formatCurrency(totalFraud)}</span>
          </div>
        </div>

        {/* Expanded View - Timeline */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1 border-t border-california-border/50">
                {/* Mini timeline bars - scrollable */}
                <div className="flex items-end gap-[2px] h-10 overflow-x-auto scrollbar-hide">
                  {timeline.map((point, index) => {
                    const maxExposed = Math.max(...timeline.map((t) => t.total_exposed))
                    const height = (point.total_exposed / maxExposed) * 100
                    const isSelected = point.period === currentPeriod
                    const isPast =
                      currentPeriod &&
                      timeline.findIndex((t) => t.period === currentPeriod) > index

                    return (
                      <button
                        key={point.period}
                        onClick={() => handlePeriodSelect(point.period)}
                        className="flex-1 min-w-[4px] relative"
                        aria-label={`${MONTHS[point.month - 1]} ${point.year}`}
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 8)}%` }}
                          transition={{ duration: 0.2, delay: index * 0.005 }}
                          className={`w-full rounded-t transition-colors ${
                            isSelected
                              ? 'bg-california-poppy'
                              : isPast
                              ? 'bg-california-poppy/40'
                              : 'bg-california-border'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Year labels */}
                <div className="flex justify-between mt-1.5 px-0.5">
                  {[2020, 2022, 2024, 2026].map((year) => (
                    <span key={year} className="text-[9px] text-text-tertiary font-medium">
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
