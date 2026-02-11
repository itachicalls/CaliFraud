/**
 * California Fraud Intelligence Design Tokens
 * These values mirror the Tailwind config for use in JS/D3
 */

export const colors = {
  california: {
    sand: '#F9FAF7',
    white: '#FFFFFF',
    border: '#E6E2D8',
    pacific: '#1E6FFF',
    poppy: '#F6B400',
    redwood: '#2E5E4E',
    sunset: '#FF7A18',
  },
  fraud: {
    low: '#FFF3C4',
    medium: '#F6B400',
    high: '#FF7A18',
    critical: '#D72638',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#5C5C5C',
    tertiary: '#8A8A8A',
  },
} as const

// Heatmap color ramp for D3 interpolation
export const HEATMAP_COLORS = [
  '#FFF3C4', // Light yellow
  '#F6B400', // Golden
  '#FF7A18', // Orange
  '#D72638', // Crimson
] as const

// Scheme type colors
export const SCHEME_COLORS: Record<string, string> = {
  telemedicine: '#1E6FFF',   // Pacific blue
  pharmacy: '#2E5E4E',       // Redwood green
  dme: '#FF7A18',            // Sunset orange
  home_health: '#F6B400',    // Golden poppy
  lab_testing: '#8B5CF6',    // Purple
  ambulance: '#EC4899',      // Pink
  hospice: '#14B8A6',        // Teal
  substance_abuse: '#D72638', // Crimson
  edd_unemployment: '#F6B400', // Golden
  ppp_fraud: '#FF7A18',       // Sunset orange
  medi_cal: '#1E6FFF',        // Pacific blue
  homeless_program: '#14B8A6', // Teal
  contract_fraud: '#EC4899',   // Pink
}

// California bounds for map
export const CALIFORNIA_BOUNDS: [[number, number], [number, number]] = [
  [-124.5, 32.5], // Southwest
  [-114.0, 42.0], // Northeast
]

export const CALIFORNIA_CENTER: [number, number] = [-119.5, 37.5]

// Animation timings
export const timing = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const

// Easing curves
export const easing = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  snap: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const

// Breakpoints
export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

// Format currency
export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Format large numbers
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// Get fraud severity level
export function getFraudSeverity(amount: number): 'low' | 'medium' | 'high' | 'critical' {
  if (amount >= 10000000) return 'critical'
  if (amount >= 1000000) return 'high'
  if (amount >= 100000) return 'medium'
  return 'low'
}

// Get color for amount
export function getAmountColor(amount: number): string {
  const severity = getFraudSeverity(amount)
  return colors.fraud[severity]
}
