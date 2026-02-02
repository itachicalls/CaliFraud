'use client'

import { useRef, useEffect, useState } from 'react'
import { Map, NavigationControl, AttributionControl, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { colors, formatCurrency, SCHEME_COLORS } from '@/lib/design-tokens'
import { useCasePoints, useCaliforniaOutline } from '@/hooks/useFraudData'
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

  const { data: casePoints } = useCasePoints()
  const { data: californiaOutline } = useCaliforniaOutline()
  const openDetailPanel = useFilterStore((state) => state.openDetailPanel)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

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
      center: [-119.5, 37.5],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 14,
    })

    mapRef.current = map

    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      setReady(true)
      map.fitBounds([[-124.5, 32.5], [-114.0, 42.0]], {
        padding: { top: 50, bottom: 100, left: 340, right: 50 },
        duration: 1500,
      })
    })

    return () => {
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

      // Heatmap layer
      map.addLayer({
        id: 'fraud-heat',
        type: 'heatmap',
        source: 'fraud',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'amount_exposed'],
            0, 0, 100000, 0.3, 1000000, 0.5, 10000000, 0.8, 100000000, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.3, 8, 1],
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(255,248,220,0)',
            0.2, 'rgba(255,243,180,0.5)',
            0.4, 'rgba(246,180,0,0.7)',
            0.6, 'rgba(255,122,24,0.8)',
            0.8, 'rgba(215,38,56,0.9)',
            1, 'rgba(180,20,40,1)'],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 25, 8, 50, 12, 80],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.9, 11, 0.5],
        },
      })

      // Circle markers
      map.addLayer({
        id: 'fraud-points',
        type: 'circle',
        source: 'fraud',
        minzoom: 7,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'amount_exposed'],
            0, 5, 1000000, 10, 10000000, 16, 100000000, 24],
          'circle-color': ['match', ['get', 'scheme_type'],
            'telemedicine', '#1E6FFF',
            'pharmacy', '#2E5E4E',
            'dme', '#FF7A18',
            'home_health', '#F6B400',
            'lab_testing', '#8B5CF6',
            'ambulance', '#EC4899',
            'hospice', '#14B8A6',
            'substance_abuse', '#D72638',
            '#1E6FFF'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      })

      // Interactions
      map.on('mouseenter', 'fraud-points', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        const f = e.features?.[0]
        if (f?.properties) {
          setTooltip({
            x: e.point.x,
            y: e.point.y,
            title: f.properties.title || 'Case',
            amount: f.properties.amount_exposed || 0,
            county: f.properties.county || '',
            schemeType: f.properties.scheme_type || '',
          })
        }
      })

      map.on('mousemove', 'fraud-points', (e) => {
        const f = e.features?.[0]
        if (f?.properties) {
          setTooltip({
            x: e.point.x,
            y: e.point.y,
            title: f.properties.title || 'Case',
            amount: f.properties.amount_exposed || 0,
            county: f.properties.county || '',
            schemeType: f.properties.scheme_type || '',
          })
        }
      })

      map.on('mouseleave', 'fraud-points', () => {
        map.getCanvas().style.cursor = ''
        setTooltip(null)
      })

      map.on('click', 'fraud-points', (e) => {
        const id = e.features?.[0]?.properties?.id
        if (id) openDetailPanel(Number(id))
      })
    }
  }, [ready, casePoints, openDetailPanel])

  return (
    <div className="relative w-full h-full" style={{ minHeight: '100vh' }}>
      <div ref={containerRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-28 right-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-100 p-3"
      >
        <p className="text-xs font-semibold text-gray-600 mb-2">Fraud Intensity</p>
        <div className="w-20 h-2.5 rounded-full" style={{ background: 'linear-gradient(to right, #FFF3C4, #F6B400, #FF7A18, #D72638)' }} />
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Low</span>
          <span>High</span>
        </div>
      </motion.div>
    </div>
  )
}
