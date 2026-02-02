import { useRef, useCallback, useEffect } from 'react'
import { useFilterStore } from '@/stores/filters'
import { useTimeline } from './useFraudData'

export function useTimeAnimation() {
  const { data: timeline } = useTimeline()
  const currentPeriod = useFilterStore((state) => state.currentPeriod)
  const setCurrentPeriod = useFilterStore((state) => state.setCurrentPeriod)
  const isPlaying = useFilterStore((state) => state.isPlaying)
  const setIsPlaying = useFilterStore((state) => state.setIsPlaying)
  const setDateRange = useFilterStore((state) => state.setDateRange)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIndexRef = useRef(0)

  const updateDateRangeForPeriod = useCallback(
    (period: string) => {
      const [year, month] = period.split('-').map(Number)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
      setDateRange(startDate, endDate)
    },
    [setDateRange]
  )

  const play = useCallback(() => {
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
      updateDateRangeForPeriod(period)
    }, 800)
  }, [timeline, currentPeriod, setCurrentPeriod, setIsPlaying, updateDateRangeForPeriod])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [setIsPlaying])

  const reset = useCallback(() => {
    setCurrentPeriod(null)
    setDateRange(null, null)
    pause()
  }, [setCurrentPeriod, setDateRange, pause])

  const goToIndex = useCallback(
    (index: number) => {
      if (!timeline || index < 0 || index >= timeline.length) return

      pause()
      const period = timeline[index].period
      setCurrentPeriod(period)
      updateDateRangeForPeriod(period)
    },
    [timeline, pause, setCurrentPeriod, updateDateRangeForPeriod]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    timeline,
    currentPeriod,
    isPlaying,
    play,
    pause,
    reset,
    goToIndex,
  }
}
