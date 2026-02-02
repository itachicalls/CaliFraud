'use client'

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
        focus:px-4 focus:py-2 focus:bg-california-poppy focus:text-white focus:rounded-button
        focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}
