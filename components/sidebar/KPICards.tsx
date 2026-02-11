'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatNumber, colors } from '@/lib/design-tokens'
import { useSummary } from '@/hooks/useFraudData'

interface AnimatedNumberProps {
  value: number
  format: 'currency' | 'number' | 'percent'
  duration?: number
}

function AnimatedNumber({ value, format, duration = 1000 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const animationFrame = useRef<number>()

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * eased)

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate)
      }
    }

    startTime.current = null
    animationFrame.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current)
      }
    }
  }, [value, duration])

  const formatted =
    format === 'currency'
      ? formatCurrency(displayValue)
      : format === 'percent'
      ? `${displayValue.toFixed(1)}%`
      : formatNumber(Math.round(displayValue))

  return <span>{formatted}</span>
}

interface KPICardProps {
  label: string
  value: number
  format: 'currency' | 'number' | 'percent'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  delay?: number
}

function KPICard({ label, value, format, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4"
    >
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span
          className="text-kpi text-text-primary font-semibold tracking-tight relative accent-underline"
          style={{ paddingBottom: 4 }}
        >
          <AnimatedNumber value={value} format={format} />
        </span>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.direction === 'up' ? 'text-fraud-critical' : 'text-california-redwood'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function KPICards() {
  const { data: summary, isLoading, isError } = useSummary()

  if (isLoading && !summary) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-california-border/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="divide-y divide-california-border">
        <KPICard label="Total Cases" value={0} format="number" delay={0} />
        <KPICard label="Total Exposed" value={0} format="currency" delay={0.1} />
        <KPICard label="Total Recovered" value={0} format="currency" delay={0.2} />
        <KPICard label="Recovery Rate" value={0} format="percent" delay={0.3} />
      </div>
    )
  }

  return (
    <div className="divide-y divide-california-border">
      <KPICard label="Total Cases" value={summary.total_cases} format="number" delay={0} />
      <KPICard
        label="Total Exposed"
        value={summary.total_exposed}
        format="currency"
        delay={0.1}
      />
      <KPICard
        label="Total Recovered"
        value={summary.total_recovered}
        format="currency"
        delay={0.2}
      />
      <KPICard
        label="Recovery Rate"
        value={summary.recovery_rate}
        format="percent"
        delay={0.3}
      />
    </div>
  )
}
