'use client'

import dynamic from 'next/dynamic'
import { CommandPanel, MobileNav } from '@/components/sidebar'
import { TimeScrubber, MobileTimeScrubber } from '@/components/timeline'
import { CaseDetailPanel } from '@/components/modal'
import { SkipLink } from '@/components/ui'
import { NewsFeed, TwitterFeed } from '@/components/feeds'

const MainTabs = dynamic(
  () => import('@/components/tabs/MainTabs'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-california-sand">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-california-poppy border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    ),
  }
)

const FraudChat = dynamic(
  () => import('@/components/chat/FraudChat'),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <main id="main-content" className="h-screen w-screen overflow-hidden bg-california-sand">
        {/* Main content: Map, Overview, Accountability Tracker tabs - offset by sidebar on desktop */}
        <div className="absolute inset-0 lg:left-80 top-0 right-0 bottom-0" role="main">
          <MainTabs />
        </div>

        {/* Desktop Command Panel (Sidebar) */}
        <div className="hidden lg:block">
          <CommandPanel />
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Desktop Time Scrubber */}
        <div className="hidden md:block">
          <TimeScrubber />
        </div>

        {/* Mobile Time Scrubber */}
        <div className="md:hidden">
          <MobileTimeScrubber />
        </div>

        {/* Case Detail Modal */}
        <CaseDetailPanel />

        {/* Right panel: Insight + News + Twitter - hidden on mobile */}
        <div className="fixed top-4 right-4 z-10 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-4 hidden lg:block">
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
          <NewsFeed />
          <TwitterFeed />
        </div>

        {/* Fraud Chat */}
        <FraudChat />
      </main>
    </>
  )
}
