/**
 * MapLibre GL Style Configuration
 * Uses free CartoDB Positron tiles - light, clean, California-perfect
 * No API token required
 */

import type { StyleSpecification } from 'maplibre-gl'
import { colors } from './design-tokens'

// Beautiful light basemap style using CartoDB Positron (free, no token)
export const MAPLIBRE_STYLE: StyleSpecification = {
  version: 8,
  name: 'California Light',
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 22,
      paint: {
        'raster-opacity': 1,
        'raster-saturation': -0.1,
        'raster-brightness-min': 0.05,
      },
    },
  ],
}

// Heatmap layer - California golden fraud visualization
export const heatmapLayer = {
  id: 'fraud-heatmap',
  type: 'heatmap' as const,
  source: 'fraud-data',
  paint: {
    // Weight based on fraud amount
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'amount_exposed'],
      0, 0,
      100000, 0.3,
      1000000, 0.5,
      10000000, 0.8,
      100000000, 1,
    ],
    // Intensity increases with zoom
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      4, 0.3,
      6, 0.6,
      9, 1,
    ],
    // California golden color ramp: Warm cream → Golden poppy → Sunset → Crimson
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(255, 248, 230, 0)',
      0.1, 'rgba(255, 243, 196, 0.4)',
      0.3, 'rgba(255, 223, 128, 0.6)',
      0.5, 'rgba(246, 180, 0, 0.75)',
      0.7, 'rgba(255, 122, 24, 0.85)',
      0.9, 'rgba(215, 38, 56, 0.95)',
      1, 'rgba(180, 20, 40, 1)',
    ],
    // Radius grows with zoom
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      4, 20,
      6, 35,
      8, 50,
      10, 70,
    ],
    // Fade slightly at high zoom to reveal markers
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 0.9,
      10, 0.7,
      12, 0.5,
    ],
  },
}

// Case markers - appear more at higher zoom
export const markerLayer = {
  id: 'case-markers',
  type: 'circle' as const,
  source: 'fraud-data',
  minzoom: 7,
  paint: {
    // Size based on fraud amount
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, ['interpolate', ['linear'], ['get', 'amount_exposed'], 0, 4, 100000000, 12],
      12, ['interpolate', ['linear'], ['get', 'amount_exposed'], 0, 8, 100000000, 28],
    ],
    // Color by scheme type
    'circle-color': [
      'match',
      ['get', 'scheme_type'],
      'telemedicine', colors.california.pacific,
      'pharmacy', colors.california.redwood,
      'dme', colors.california.sunset,
      'home_health', colors.california.poppy,
      'lab_testing', '#8B5CF6',
      'ambulance', '#EC4899',
      'hospice', '#14B8A6',
      'substance_abuse', colors.fraud.critical,
      colors.california.pacific,
    ],
    'circle-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, 0.6,
      10, 0.85,
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#FFFFFF',
    'circle-stroke-opacity': 0.9,
  },
}

// California state outline - golden glow
export const californiaGlowLayer = {
  id: 'california-glow',
  type: 'line' as const,
  source: 'california-outline',
  paint: {
    'line-color': colors.california.poppy,
    'line-width': 12,
    'line-opacity': 0.15,
    'line-blur': 8,
  },
}

export const californiaOutlineLayer = {
  id: 'california-outline',
  type: 'line' as const,
  source: 'california-outline',
  paint: {
    'line-color': colors.california.poppy,
    'line-width': 2.5,
    'line-opacity': 0.7,
  },
}

// Map configuration
export const CALIFORNIA_BOUNDS: [[number, number], [number, number]] = [
  [-124.5, 32.5],
  [-114.0, 42.0],
]

export const CALIFORNIA_CENTER: [number, number] = [-119.5, 37.5]
export const DEFAULT_ZOOM = 5.5
export const MIN_ZOOM = 4
export const MAX_ZOOM = 14
