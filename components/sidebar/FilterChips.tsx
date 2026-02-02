'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { SCHEME_COLORS } from '@/lib/design-tokens'
import { useSchemeTypes } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'

function formatSchemeType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface ChipProps {
  label: string
  color: string
  isSelected: boolean
  onClick: () => void
}

function Chip({ label, color, isSelected, onClick }: ChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'px-3 py-1.5 rounded-chip text-sm font-medium transition-all duration-200',
        'border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-california-poppy',
        isSelected
          ? 'text-white shadow-sm'
          : 'bg-white text-text-secondary hover:text-text-primary'
      )}
      style={{
        borderColor: color,
        backgroundColor: isSelected ? color : undefined,
      }}
    >
      <span className="flex items-center gap-2">
        {!isSelected && (
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        {label}
      </span>
    </motion.button>
  )
}

export default function FilterChips() {
  const { data: schemeTypes, isLoading } = useSchemeTypes()
  const schemeType = useFilterStore((state) => state.schemeType)
  const setSchemeType = useFilterStore((state) => state.setSchemeType)

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-california-border/30 rounded-chip animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Scheme Type</h3>
      <div className="flex flex-wrap gap-2">
        <Chip
          label="All Types"
          color="#6B7280"
          isSelected={schemeType === null}
          onClick={() => setSchemeType(null)}
        />
        {schemeTypes?.map((type) => (
          <Chip
            key={type}
            label={formatSchemeType(type)}
            color={SCHEME_COLORS[type] || '#6B7280'}
            isSelected={schemeType === type}
            onClick={() => setSchemeType(schemeType === type ? null : type)}
          />
        ))}
      </div>
    </div>
  )
}
