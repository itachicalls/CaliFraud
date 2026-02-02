'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/design-tokens'
import { useFilterStore } from '@/stores/filters'

interface SliderProps {
  label: string
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (v) => v.toString(),
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), localValue[1] - step)
      setLocalValue([newMin, localValue[1]])
    },
    [localValue, step]
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), localValue[0] + step)
      setLocalValue([localValue[0], newMax])
    },
    [localValue, step]
  )

  const handleMouseUp = useCallback(() => {
    onChange(localValue)
  }, [localValue, onChange])

  const percentage = (val: number) => ((val - min) / (max - min)) * 100

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <span className="text-xs text-text-tertiary">
          {formatValue(localValue[0])} - {formatValue(localValue[1])}
        </span>
      </div>

      <div className="relative h-2">
        {/* Track background */}
        <div className="absolute inset-0 bg-california-border rounded-full" />

        {/* Active track */}
        <div
          className="absolute h-full bg-california-poppy rounded-full"
          style={{
            left: `${percentage(localValue[0])}%`,
            right: `${100 - percentage(localValue[1])}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-california-poppy
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-california-poppy"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-california-poppy
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-california-poppy"
        />
      </div>
    </div>
  )
}

export default function RangeSliders() {
  const minAmount = useFilterStore((state) => state.minAmount)
  const maxAmount = useFilterStore((state) => state.maxAmount)
  const setAmountRange = useFilterStore((state) => state.setAmountRange)

  const amountValue: [number, number] = [minAmount ?? 0, maxAmount ?? 100000000]

  return (
    <div className="px-4 pb-4">
      <RangeSlider
        label="Fraud Amount"
        min={0}
        max={100000000}
        step={100000}
        value={amountValue}
        onChange={([min, max]) => {
          setAmountRange(min === 0 ? null : min, max === 100000000 ? null : max)
        }}
        formatValue={formatCurrency}
      />
    </div>
  )
}
