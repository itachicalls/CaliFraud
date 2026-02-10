'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CaliforniaMap from '@/components/map/CaliforniaMap'
import OverviewTab from './OverviewTab'
import AccountabilityTrackerTab from './AccountabilityTrackerTab'

type TabId = 'map' | 'overview' | 'accountability'

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('map')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'map', label: 'Map' },
    { id: 'overview', label: 'Overview' },
    { id: 'accountability', label: 'Accountability Tracker' },
  ]

  return (
    <div className="h-full w-full flex flex-col">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-center gap-1 px-4 py-3 bg-california-white/95 backdrop-blur border-b border-california-border z-30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-california-poppy text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-california-sand/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <CaliforniaMap />
            </motion.div>
          )}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-0 bg-california-sand overflow-auto"
            >
              <OverviewTab />
            </motion.div>
          )}
          {activeTab === 'accountability' && (
            <motion.div
              key="accountability"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-0 bg-california-sand overflow-auto"
            >
              <AccountabilityTrackerTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
