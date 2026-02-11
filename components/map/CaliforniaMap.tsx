'use client'

import { useRef, useEffect, useState } from 'react'
import { Map, NavigationControl, AttributionControl, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, formatCurrency, SCHEME_COLORS } from '@/lib/design-tokens'
import { useMapCasePoints, useCaliforniaOutline } from '@/hooks/useFraudData'
import { useFilterStore } from '@/stores/filters'

interface MapTooltip {
  x: number
  y: number
  title: string
  amount: number
  county: string
  schemeType: string
}

export default function CaliforniaMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null)

  const { data: casePoints } = useMapCasePoints()
  const { data: californiaOutline } = useCaliforniaOutline()
  const openDetailPanel = useFilterStore((state) => state.openDetailPanel)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Detect mobile
    const isMobile = window.innerWidth < 768

    const map = new Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'carto': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap © CARTO',
          },
        },
        layers: [{
          id: 'carto-tiles',
          type: 'raster',
          source: 'carto',
        }],
      },
      // Start centered on California
      center: [-119.5, 37.0],
      zoom: isMobile ? 4.8 : 5.5,
      minZoom: 4,
      maxZoom: 14,
    })

    mapRef.current = map

    // Only show navigation controls on desktop
    if (!isMobile) {
      map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    }
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      setReady(true)
      
      // Different padding for mobile vs desktop (content area is now right of sidebar)
      const padding = isMobile 
        ? { top: 80, bottom: 140, left: 20, right: 20 }
        : { top: 50, bottom: 100, left: 20, right: 80 }
      
      map.fitBounds([[-124.5, 32.5], [-114.0, 42.0]], {
        padding,
        duration: 1500,
      })
    })

    // Handle resize for responsive padding
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768
      const padding = nowMobile 
        ? { top: 80, bottom: 140, left: 20, right: 20 }
        : { top: 50, bottom: 100, left: 20, right: 80 }
      
      map.fitBounds([[-124.5, 32.5], [-114.0, 42.0]], {
        padding,
        duration: 500,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Add California outline
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !californiaOutline) return

    if (!map.getSource('ca-outline')) {
      map.addSource('ca-outline', {
        type: 'geojson',
        data: californiaOutline,
      })

      map.addLayer({
        id: 'ca-glow',
        type: 'line',
        source: 'ca-outline',
        paint: {
          'line-color': '#F6B400',
          'line-width': 10,
          'line-blur': 6,
          'line-opacity': 0.25,
        },
      })

      map.addLayer({
        id: 'ca-border',
        type: 'line',
        source: 'ca-outline',
        paint: {
          'line-color': '#F6B400',
          'line-width': 2.5,
          'line-opacity': 0.8,
        },
      })
    }
  }, [ready, californiaOutline])

  // Add fraud data layers
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !casePoints) return

    if (map.getSource('fraud')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map.getSource('fraud') as GeoJSONSource).setData(casePoints as any)
    } else {
      map.addSource('fraud', {
        type: 'geojson',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: casePoints as any,
      })

      // Heatmap — vivid thermal gradient (deep blue → cyan → green → yellow → orange → red/white)
      map.addLayer({
        id: 'fraud-heat',
        type: 'heatmap',
        source: 'fraud',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'amount_exposed'],
            0, 0.05, 100000, 0.25, 1000000, 0.45, 10000000, 0.7, 100000000, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'],
            4, 0.8, 6, 1.2, 8, 1.6, 10, 1.8, 12, 2],
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(0, 0, 30, 0)',
            0.05, 'rgba(10, 20, 80, 0.35)',
            0.12, 'rgba(20, 50, 160, 0.55)',
            0.2,  'rgba(30, 100, 220, 0.7)',
            0.3,  'rgba(0, 180, 220, 0.78)',
            0.4,  'rgba(0, 210, 170, 0.82)',
            0.5,  'rgba(50, 220, 100, 0.86)',
            0.6,  'rgba(160, 230, 50, 0.9)',
            0.7,  'rgba(230, 220, 30, 0.92)',
            0.8,  'rgba(255, 170, 0, 0.94)',
            0.9,  'rgba(255, 80, 0, 0.96)',
            1,    'rgba(255, 30, 30, 1)'],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'],
            4, 35, 6, 55, 8, 80, 10, 110, 12, 140],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'],
            4, 0.85, 7, 0.92, 10, 0.85, 13, 0.7, 15, 0.4],
        },
      })

      // Glow ring behind each point (visible when zoomed in)
      map.addLayer({
        id: 'fraud-points-glow',
        type: 'circle',
        source: 'fraud',
        minzoom: 8,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, 6, 10, 10, 12, 14, 14, 20,
          ],
          'circle-color': ['match', ['get', 'scheme_type'],
            'telemedicine', '#1E6FFF',
            'pharmacy', '#2E5E4E',
            'dme', '#FF7A18',
            'home_health', '#F6B400',
            'lab_testing', '#8B5CF6',
            'ambulance', '#EC4899',
            'hospice', '#14B8A6',
            'substance_abuse', '#D72638',
            'edd_unemployment', '#F6B400',
            'ppp_fraud', '#FF7A18',
            'medi_cal', '#1E6FFF',
            'homeless_program', '#14B8A6',
            'contract_fraud', '#EC4899',
            '#1E6FFF'],
          'circle-opacity': 0.18,
          'circle-blur': 1,
        },
      })

      // Individual case circles - crisp dots on top
      map.addLayer({
        id: 'fraud-points',
        type: 'circle',
        source: 'fraud',
        minzoom: 8,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, 3, 10, 5, 12, 7, 14, 10,
          ],
          'circle-color': ['match', ['get', 'scheme_type'],
            'telemedicine', '#1E6FFF',
            'pharmacy', '#2E5E4E',
            'dme', '#FF7A18',
            'home_health', '#F6B400',
            'lab_testing', '#8B5CF6',
            'ambulance', '#EC4899',
            'hospice', '#14B8A6',
            'substance_abuse', '#D72638',
            'edd_unemployment', '#F6B400',
            'ppp_fraud', '#FF7A18',
            'medi_cal', '#1E6FFF',
            'homeless_program', '#14B8A6',
            'contract_fraud', '#EC4899',
            '#1E6FFF'],
          'circle-opacity': 0.92,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.9)',
        },
      })

      map.on('mouseenter', 'fraud-points', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        const f = e.features?.[0]
        if (f?.properties) {
          setTooltip({
            x: e.point.x,
            y: e.point.y,
            title: String(f.properties.title || 'Case'),
            amount: Number(f.properties.amount_exposed || 0),
            county: String(f.properties.county || ''),
            schemeType: String(f.properties.scheme_type || ''),
          })
        }
      })

      map.on('mousemove', 'fraud-points', (e) => {
        const f = e.features?.[0]
        if (f?.properties) {
          setTooltip({
            x: e.point.x,
            y: e.point.y,
            title: String(f.properties.title || 'Case'),
            amount: Number(f.properties.amount_exposed || 0),
            county: String(f.properties.county || ''),
            schemeType: String(f.properties.scheme_type || ''),
          })
        }
      })

      map.on('mouseleave', 'fraud-points', () => {
        map.getCanvas().style.cursor = ''
        setTooltip(null)
      })

      map.on('mouseenter', 'fraud-heat', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'fraud-heat', () => { map.getCanvas().style.cursor = '' })

      map.on('click', 'fraud-points', (e) => {
        const id = e.features?.[0]?.properties?.id
        if (id != null) openDetailPanel(Number(id))
      })

      map.on('click', 'fraud-heat', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['fraud-points'] })
        if (features.length > 0) {
          const id = features[0]?.properties?.id
          if (id != null) openDetailPanel(Number(id))
        } else {
          map.easeTo({ center: e.lngLat, zoom: 9, duration: 500 })
        }
      })
    }
  }, [ready, casePoints, openDetailPanel])

  return (
    <div className="relative w-full h-full" style={{ minHeight: '50vh' }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {!ready && (
          <motion.div
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: '#F9FAF7' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-[#F6B400] border-t-transparent animate-spin" />
              <span className="text-sm text-gray-500">Loading California...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 12, transform: 'translateY(-100%)' }}
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 min-w-[180px]">
              <p className="font-semibold text-gray-900 text-sm line-clamp-2">{tooltip.title}</p>
              <p className="text-[#F6B400] font-bold text-xl mt-1">{formatCurrency(tooltip.amount)}</p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="w-2 h-2 rounded-full" style={{ background: SCHEME_COLORS[tooltip.schemeType] || '#1E6FFF' }} />
                <span className="text-gray-500 text-xs capitalize">{tooltip.schemeType.replace(/_/g, ' ')}</span>
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-gray-500 text-xs">{tooltip.county}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fraud intensity legend - accumulated sum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-3
          bottom-36 left-4 right-auto md:bottom-28"
      >
        <p className="text-xs font-semibold text-gray-600 mb-2">
          Fraud Intensity
        </p>
        <div className="w-32 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #0a1450, #1e64dc, #00b4dc, #32dc64, #e6e61e, #ffaa00, #ff5000, #ff1e1e)' }} />
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Low</span>
          <span>Critical</span>
        </div>
      </motion.div>
    </div>
  )
}
