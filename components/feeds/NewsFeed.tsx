'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

interface NewsItem {
  title: string
  link: string
  pubDate?: string
  source?: string
}

function formatDate(s?: string) {
  if (!s) return ''
  try {
    const d = new Date(s)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

export default function NewsFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await fetch('/api/news')
      const json = await res.json()
      return (json.items || []) as NewsItem[]
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-card shadow-card border border-california-border overflow-hidden">
      <div className="px-4 py-3 border-b border-california-border bg-california-poppy/5">
        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
          <span className="text-california-poppy">📰</span> California Fraud News
        </h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-california-border/30 rounded animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <ul className="divide-y divide-california-border/50">
            {data.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 hover:bg-california-sand/50 transition-colors group"
                >
                  <p className="text-sm text-text-primary line-clamp-2 group-hover:text-california-poppy transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {formatDate(item.pubDate)}
                  </p>
                </a>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-text-secondary">
            No recent headlines. Try again later.
          </p>
        )}
      </div>
    </div>
  )
}
