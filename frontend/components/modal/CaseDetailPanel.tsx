'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCase } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'
import { formatCurrency, SCHEME_COLORS, colors } from '@/lib/design-tokens'
import { format } from 'date-fns'

function formatSchemeType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: 'bg-california-pacific/10', text: 'text-california-pacific' },
    settled: { bg: 'bg-california-redwood/10', text: 'text-california-redwood' },
    convicted: { bg: 'bg-fraud-critical/10', text: 'text-fraud-critical' },
    dismissed: { bg: 'bg-text-tertiary/10', text: 'text-text-tertiary' },
  }

  const color = statusColors[status] || statusColors.open

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${color.bg} ${color.text}`}
    >
      {status}
    </span>
  )
}

export default function CaseDetailPanel() {
  const selectedCaseId = useFilterStore((state) => state.selectedCaseId)
  const detailPanelOpen = useFilterStore((state) => state.detailPanelOpen)
  const closeDetailPanel = useFilterStore((state) => state.closeDetailPanel)

  const { data: caseData, isLoading } = useCase(selectedCaseId)

  return (
    <AnimatePresence>
      {detailPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailPanel}
            className="fixed inset-0 bg-black/10 z-30"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 max-h-[70vh]"
          >
            <div className="bg-california-white rounded-t-2xl shadow-modal mx-auto max-w-2xl">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-california-border rounded-full" />
              </div>

              {/* Close button */}
              <button
                onClick={closeDetailPanel}
                className="absolute top-4 right-4 p-2 hover:bg-california-sand rounded-full transition-colors"
                aria-label="Close panel"
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

              {/* Content */}
              <div className="px-6 pb-6 overflow-y-auto max-h-[calc(70vh-60px)]">
                {isLoading ? (
                  <div className="space-y-4 py-8">
                    <div className="h-8 bg-california-border/30 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-california-border/30 rounded animate-pulse w-1/2" />
                    <div className="h-20 bg-california-border/30 rounded animate-pulse" />
                  </div>
                ) : caseData ? (
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h2 className="text-xl font-semibold text-text-primary leading-tight">
                          {caseData.title}
                        </h2>
                        <StatusBadge status={caseData.status} />
                      </div>
                      <p className="text-sm text-text-secondary">
                        Case #{caseData.case_number}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="bg-california-sand rounded-card p-4 mb-6">
                      <p className="text-sm text-text-secondary mb-1">Amount Exposed</p>
                      <p className="text-3xl font-semibold text-california-poppy">
                        {caseData.amount_exposed
                          ? formatCurrency(caseData.amount_exposed)
                          : 'Not disclosed'}
                      </p>
                      {caseData.amount_recovered && caseData.amount_recovered > 0 && (
                        <p className="text-sm text-california-redwood mt-2">
                          {formatCurrency(caseData.amount_recovered)} recovered
                        </p>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      {/* Description */}
                      {caseData.description && (
                        <div>
                          <h3 className="text-sm font-medium text-text-secondary mb-1">
                            Summary
                          </h3>
                          <p className="text-text-primary">{caseData.description}</p>
                        </div>
                      )}

                      <div className="border-t border-california-border pt-4" />

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Scheme Type */}
                        <div>
                          <h3 className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                            Scheme Type
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  SCHEME_COLORS[caseData.scheme_type] ||
                                  colors.california.pacific,
                              }}
                            />
                            <span className="text-text-primary font-medium">
                              {formatSchemeType(caseData.scheme_type)}
                            </span>
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <h3 className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                            Location
                          </h3>
                          <p className="text-text-primary font-medium">
                            {caseData.city && `${caseData.city}, `}
                            {caseData.county} County
                          </p>
                        </div>

                        {/* Date Filed */}
                        <div>
                          <h3 className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                            Date Filed
                          </h3>
                          <p className="text-text-primary font-medium">
                            {caseData.date_filed
                              ? format(new Date(caseData.date_filed), 'MMM d, yyyy')
                              : 'Unknown'}
                          </p>
                        </div>

                        {/* Date Resolved */}
                        {caseData.date_resolved && (
                          <div>
                            <h3 className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                              Date Resolved
                            </h3>
                            <p className="text-text-primary font-medium">
                              {format(new Date(caseData.date_resolved), 'MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Source link */}
                      {caseData.source_url && (
                        <>
                          <div className="border-t border-california-border pt-4" />
                          <a
                            href={caseData.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-california-pacific 
                              hover:text-california-sunset transition-colors text-sm font-medium"
                          >
                            View Source Documentation
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-secondary">
                    Case not found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
