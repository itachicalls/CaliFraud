'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { SCHEME_COLORS } from '@/lib/design-tokens'
import { useSchemeTypes, useTypologies } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'

const TYPOLOGY_COLORS: Record<string, string> = {
  healthcare: '#D72638',
  relief: '#FF7A18',
  tax: '#8B5CF6',
  employment: '#1E6FFF',
  kickbacks: '#EC4899',
  shell_entities: '#6B7280',
  benefits: '#F6B400',
  government_contracts: '#2E5E4E',
  insurance: '#14B8A6',
}

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
  const { data: typologies, isLoading: typologiesLoading } = useTypologies()
  const schemeType = useFilterStore((state) => state.schemeType)
  const typology = useFilterStore((state) => state.typology)
  const stillOperating = useFilterStore((state) => state.stillOperating)
  const setSchemeType = useFilterStore((state) => state.setSchemeType)
  const setTypology = useFilterStore((state) => state.setTypology)
  const setStillOperating = useFilterStore((state) => state.setStillOperating)

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
    <div className="p-4 space-y-4">
      {/* Typology */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">Typology</h3>
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All"
            color="#6B7280"
            isSelected={typology === null}
            onClick={() => setTypology(null)}
          />
          {!typologiesLoading &&
            typologies?.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                color={TYPOLOGY_COLORS[t.value] || '#6B7280'}
                isSelected={typology === t.value}
                onClick={() => setTypology(typology === t.value ? null : t.value)}
              />
            ))}
        </div>
      </div>

      {/* Scheme Type */}
      <div>
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

      {/* Still Operating */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stillOperating === true}
            onChange={(e) => setStillOperating(e.target.checked ? true : null)}
            className="rounded border-california-border"
          />
          <span className="text-sm text-text-primary">Still operating (sanctioned)</span>
        </label>
      </div>
    </div>
  )
}
