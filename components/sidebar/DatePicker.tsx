'use client'

import { useState } from 'react'
import { useFilterStore } from '@/stores/filters'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

interface QuickOption {
  label: string
  value: { start: string | null; end: string | null }
}

const QUICK_OPTIONS: QuickOption[] = [
  { label: 'All Time', value: { start: null, end: null } },
  { label: '2026', value: { start: '2026-01-01', end: '2026-02-02' } },
  { label: '2025', value: { start: '2025-01-01', end: '2025-12-31' } },
  { label: '2024', value: { start: '2024-01-01', end: '2024-12-31' } },
  { label: '2020-2023', value: { start: '2020-01-01', end: '2023-12-31' } },
]

export default function DatePicker() {
  const startDate = useFilterStore((state) => state.startDate)
  const endDate = useFilterStore((state) => state.endDate)
  const setDateRange = useFilterStore((state) => state.setDateRange)

  const [expanded, setExpanded] = useState(false)

  const getCurrentLabel = () => {
    if (!startDate && !endDate) return 'All Time'
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start.getFullYear() === end.getFullYear() && 
          start.getMonth() === 0 && end.getMonth() === 11) {
        return start.getFullYear().toString()
      }
      return `${MONTHS[start.getMonth()]} ${start.getFullYear()} - ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
    }
    return 'Custom'
  }

  return (
    <div className="p-4 border-t border-california-border">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Date Range</h3>
      
      {/* Quick options */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_OPTIONS.map((option) => {
          const isSelected = 
            option.value.start === startDate && 
            option.value.end === endDate
          
          return (
            <button
              key={option.label}
              onClick={() => setDateRange(option.value.start, option.value.end)}
              className={`px-3 py-1 text-xs font-medium rounded-button transition-all
                ${isSelected 
                  ? 'bg-california-poppy text-white' 
                  : 'bg-california-sand text-text-secondary hover:bg-california-border'
                }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Custom date inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">From</label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => setDateRange(e.target.value || null, endDate)}
            className="w-full px-2 py-1.5 text-sm border border-california-border rounded-button
              bg-white focus:outline-none focus:border-california-poppy
              text-text-primary"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">To</label>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => setDateRange(startDate, e.target.value || null)}
            className="w-full px-2 py-1.5 text-sm border border-california-border rounded-button
              bg-white focus:outline-none focus:border-california-poppy
              text-text-primary"
          />
        </div>
      </div>
    </div>
  )
}
