'use client'

import dynamic from 'next/dynamic'
import { CommandPanel, MobileNav } from '@/components/sidebar'
import { TimeScrubber } from '@/components/timeline'
import { CaseDetailPanel } from '@/components/modal'
import { SkipLink } from '@/components/ui'

// Dynamic import for map to avoid SSR issues with Mapbox
const CaliforniaMap = dynamic(
  () => import('@/components/map/CaliforniaMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-california-sand">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-california-poppy border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading California map...</p>
        </div>
      </div>
    )
  }
)

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <main id="main-content" className="h-screen w-screen overflow-hidden bg-california-sand">
        {/* Map background */}
        <div className="absolute inset-0 w-full h-full" role="application" aria-label="California fraud map">
          <CaliforniaMap />
        </div>

        {/* Desktop Command Panel (Sidebar) */}
        <div className="hidden lg:block">
          <CommandPanel />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Time Scrubber - responsive positioning */}
        <div className="hidden md:block">
          <TimeScrubber />
        </div>

        {/* Case Detail Modal */}
        <CaseDetailPanel />

        {/* Insight Callout - hidden on mobile */}
        <div className="fixed top-4 right-4 z-10 max-w-xs hidden md:block">
          <div 
            className="bg-white/95 backdrop-blur-sm rounded-card shadow-card border border-california-border p-4"
            role="complementary"
            aria-label="Data insight"
          >
            <div className="w-8 h-0.5 bg-california-poppy rounded mb-2" aria-hidden="true" />
            <p className="text-sm text-text-primary">
              <span className="font-medium">Southern CA telemedicine fraud</span>{' '}
              surged during 2020-2021, coinciding with the pandemic.
            </p>
          </div>
        </div>

        {/* Mobile bottom info bar */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-10 p-4 bg-gradient-to-t from-california-sand">
          <div className="glass rounded-card p-3 text-center">
            <p className="text-sm text-text-secondary">
              Tap markers for case details
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
