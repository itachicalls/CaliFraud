'use client'

const X_SEARCH_URL = 'https://twitter.com/search?q=california%20fraud&src=typed_query&f=live'

export default function TwitterFeed() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-card shadow-card border border-california-border overflow-hidden">
      <div className="px-4 py-3 border-b border-california-border bg-[#14171a]/5">
        <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Live on X
        </h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-text-secondary mb-4">
          See the latest posts about California fraud on X (Twitter).
        </p>
        <a
          href={X_SEARCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14171a] text-white rounded-xl font-medium text-sm hover:bg-[#272c30] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          View search: California fraud
        </a>
      </div>
    </div>
  )
}
