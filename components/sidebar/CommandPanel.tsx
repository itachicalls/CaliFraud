'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useFilterStore } from '@/stores/filters'
import KPICards from './KPICards'
import FilterChips from './FilterChips'
import RangeSliders from './RangeSliders'
import DatePicker from './DatePicker'
import { AnalyticsPanel } from '@/components/analytics'

export default function CommandPanel() {
  const sidebarOpen = useFilterStore((state) => state.sidebarOpen)
  const toggleSidebar = useFilterStore((state) => state.toggleSidebar)
  const clearFilters = useFilterStore((state) => state.clearFilters)

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-california-white shadow-panel z-20
              flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-california-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">
                    CaliFraud
                  </h1>
                  <p className="text-sm text-text-secondary">Intelligence Platform</p>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-california-sand rounded-button transition-colors"
                  aria-label="Close sidebar"
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
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* KPIs */}
              <KPICards />

              <div className="border-t border-california-border" />

              {/* Filters */}
              <FilterChips />

              <div className="border-t border-california-border" />

              <RangeSliders />

              <DatePicker />

              <AnalyticsPanel />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-california-border">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-text-secondary
                  hover:text-california-poppy hover:bg-california-sand
                  rounded-button transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button when closed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed left-4 top-4 z-20 p-3 bg-california-white shadow-panel 
              rounded-card hover:shadow-card-hover transition-shadow"
            aria-label="Open sidebar"
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
              className="text-text-primary"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
