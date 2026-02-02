'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useFilterStore } from '@/stores/filters'
import FilterChips from './FilterChips'
import RangeSliders from './RangeSliders'
import DatePicker from './DatePicker'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-20 p-3 bg-california-white shadow-card rounded-card
          lg:hidden"
        aria-label="Open filters"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

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
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-california-white rounded-t-2xl
                shadow-modal max-h-[80vh] overflow-y-auto lg:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-california-white">
                <div className="w-10 h-1 bg-california-border rounded-full" />
              </div>

              {/* Header */}
              <div className="px-4 pb-3 flex items-center justify-between border-b border-california-border">
                <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-california-sand rounded-full transition-colors"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <div className="pb-safe">
                <FilterChips />
                <div className="border-t border-california-border" />
                <RangeSliders />
                <DatePicker />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
