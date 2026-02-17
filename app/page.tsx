'use client'

import { useState } from 'react'
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
  const [feedCollapsed, setFeedCollapsed] = useState(false)
  return (
    <>
      <SkipLink />
      <main id="main-content" className="h-screen w-screen overflow-hidden bg-california-sand">
        {/* Main content: Map, Overview, Accountability Tracker tabs - offset by sidebar on desktop */}
        <div className="absolute inset-0 pt-16 md:pt-0 lg:left-80 lg:pt-0 top-0 right-0 bottom-0" role="main">
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

        {/* Right panel: Insight + News + Twitter - hidden on mobile, collapsible */}
        <div className="fixed top-16 right-4 z-10 hidden lg:block">
          {feedCollapsed ? (
            <button
              onClick={() => setFeedCollapsed(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-card border border-california-border text-california-poppy hover:bg-white transition-colors"
              aria-label="Expand news and Twitter feeds"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          ) : (
            <div className="w-80 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-4">
              <div
                className="bg-white/95 backdrop-blur-sm rounded-card shadow-card border border-california-border overflow-hidden"
                role="complementary"
                aria-label="Data insight"
              >
                <div className="flex items-center justify-between p-3 border-b border-california-border">
                  <span className="text-sm font-medium text-text-primary">News & Feeds</span>
                  <button
                    onClick={() => setFeedCollapsed(true)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-california-sand/50 text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Collapse panel"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="w-8 h-0.5 bg-california-poppy rounded mb-2" aria-hidden="true" />
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">Southern CA telemedicine fraud</span>{' '}
                      surged during 2020-2021, coinciding with the pandemic.
                    </p>
                  </div>
                  <NewsFeed />
                  <TwitterFeed />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fraud Chat */}
        <FraudChat />
      </main>
    </>
  )
}
