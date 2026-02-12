'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useCases } from '@/hooks/useFraudData'
import { formatCurrency, SCHEME_COLORS } from '@/lib/design-tokens'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════ */

const BG = 0x060a14
const INNER_R = 28
const OUTER_R = 56
const PARTICLE_N = 600

const SCHEME_LABELS: Record<string, string> = {
  edd_unemployment: 'EDD Unemployment',
  ppp_fraud: 'PPP Loan Fraud',
  medi_cal: 'Medi-Cal Fraud',
  telemedicine: 'Telemedicine',
  pharmacy: 'Pharmacy Fraud',
  substance_abuse: 'Substance Abuse',
  homeless_program: 'Homeless Programs',
  contract_fraud: 'Contract Fraud',
}

const SCHEME_HEX: Record<string, number> = {
  edd_unemployment: 0xf6b400,
  ppp_fraud: 0xff7a18,
  medi_cal: 0x1e6fff,
  telemedicine: 0x8b5cf6,
  pharmacy: 0x3d9b6e,
  substance_abuse: 0xd72638,
  homeless_program: 0x14b8a6,
  contract_fraud: 0xec4899,
}

const COUNTY_LAT: Record<string, number> = {
  'Imperial': 32.85, 'San Diego': 32.72, 'Orange': 33.72, 'Riverside': 33.98,
  'Los Angeles': 34.05, 'San Bernardino': 34.11, 'Ventura': 34.27, 'Santa Barbara': 34.42,
  'San Luis Obispo': 35.28, 'Kern': 35.37, 'Tulare': 36.21, 'Monterey': 36.60,
  'Fresno': 36.74, 'Merced': 37.30, 'Santa Clara': 37.35, 'Stanislaus': 37.51,
  'San Mateo': 37.56, 'San Francisco': 37.77, 'Alameda': 37.80, 'Contra Costa': 37.92,
  'San Joaquin': 37.96, 'Marin': 38.08, 'Solano': 38.25, 'Sonoma': 38.51,
  'Sacramento': 38.58, 'El Dorado': 38.78, 'Placer': 39.09, 'Butte': 39.66,
  'Shasta': 40.59, 'Humboldt': 40.75,
}

const STATUS_COLOR: Record<string, string> = {
  open: '#ef4444', under_investigation: '#f59e0b', charged: '#a855f7', settled: '#3b82f6', convicted: '#22c55e',
}
const STATUS_LABEL: Record<string, string> = {
  open: 'Open', under_investigation: 'Under Investigation', charged: 'Charged', settled: 'Settled', convicted: 'Convicted',
}

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface FraudNode {
  id: string; type: 'scheme' | 'county'; label: string
  count: number; exposed: number; color: number; cssColor: string; position: THREE.Vector3
}
interface FraudEdge {
  fromId: string; toId: string; count: number; exposed: number; color: number
  curve: THREE.QuadraticBezierCurve3
}
interface FraudNetwork {
  nodes: FraudNode[]; edges: FraudEdge[]; nodeMap: Map<string, FraudNode>
  totalCases: number; totalExposed: number; countyCount: number; schemeCount: number
  nodeDetails: Map<string, { label: string; count: number; exposed: number; color: string }[]>
  edgeCDF: number[]
  schemeNodeCount: number
}
interface TooltipData {
  type: 'scheme' | 'county'; id: string; label: string
  count: number; exposed: number
  details: { label: string; count: number; exposed: number; color: string }[]
}
interface SelectedDetail {
  type: string; label: string; cssColor: string; isScheme: boolean
  totalExposed: number; totalRecovered: number; totalLost: number
  recoveryRate: number; caseCount: number; connectedCount: number
  avgCaseValue: number; largestCase: { title: string; amount: number }
  dateRange: { earliest: string; latest: string }
  statusBreakdown: { label: string; count: number; pct: number; color: string }[]
  breakdown: { label: string; count: number; exposed: number; pct: number; color: string }[]
}

/* ═══════════════════════════════════════════════════════════════
   Build network graph
   ═══════════════════════════════════════════════════════════════ */

function buildFraudNetwork(cases: any[]): FraudNetwork {
  const countyAgg = new Map<string, { count: number; exposed: number; schemes: Map<string, { count: number; exposed: number }> }>()
  const schemeAgg = new Map<string, { count: number; exposed: number; counties: Map<string, { count: number; exposed: number }> }>()
  let totalExposed = 0

  for (const c of cases) {
    const county: string = c.county || 'Unknown'
    const scheme: string = c.scheme_type || 'unknown'
    const amt: number = c.amount_exposed ?? 0
    totalExposed += amt
    if (!countyAgg.has(county)) countyAgg.set(county, { count: 0, exposed: 0, schemes: new Map() })
    const cd = countyAgg.get(county)!; cd.count++; cd.exposed += amt
    if (!cd.schemes.has(scheme)) cd.schemes.set(scheme, { count: 0, exposed: 0 })
    const csd = cd.schemes.get(scheme)!; csd.count++; csd.exposed += amt
    if (!schemeAgg.has(scheme)) schemeAgg.set(scheme, { count: 0, exposed: 0, counties: new Map() })
    const sd = schemeAgg.get(scheme)!; sd.count++; sd.exposed += amt
    if (!sd.counties.has(county)) sd.counties.set(county, { count: 0, exposed: 0 })
    const scd = sd.counties.get(county)!; scd.count++; scd.exposed += amt
  }

  const schemeList = [...schemeAgg.keys()].sort((a, b) => schemeAgg.get(b)!.exposed - schemeAgg.get(a)!.exposed)
  const schemeNodes: FraudNode[] = schemeList.map((scheme, i) => {
    const angle = (i / schemeList.length) * Math.PI * 2 - Math.PI / 2
    return {
      id: `scheme:${scheme}`, type: 'scheme' as const,
      label: SCHEME_LABELS[scheme] || scheme.replace(/_/g, ' '),
      count: schemeAgg.get(scheme)!.count, exposed: schemeAgg.get(scheme)!.exposed,
      color: SCHEME_HEX[scheme] || 0xaaaaaa, cssColor: SCHEME_COLORS[scheme] || '#aaaaaa',
      position: new THREE.Vector3(INNER_R * Math.cos(angle), 0, INNER_R * Math.sin(angle)),
    }
  })

  const countyList = [...countyAgg.keys()].sort((a, b) => countyAgg.get(b)!.exposed - countyAgg.get(a)!.exposed)
  const countyNodes: FraudNode[] = countyList.map((county, i) => {
    const angle = (i / countyList.length) * Math.PI * 2
    const y = ((COUNTY_LAT[county] ?? 36.5) - 36.5) * 3.5
    return {
      id: `county:${county}`, type: 'county' as const, label: county,
      count: countyAgg.get(county)!.count, exposed: countyAgg.get(county)!.exposed,
      color: 0xc0c8e0, cssColor: '#c0c8e0',
      position: new THREE.Vector3(OUTER_R * Math.cos(angle), y, OUTER_R * Math.sin(angle)),
    }
  })

  const allNodes = [...schemeNodes, ...countyNodes]
  const nodeMap = new Map(allNodes.map(n => [n.id, n]))

  const edges: FraudEdge[] = []
  let ei = 0
  for (const [county, cData] of countyAgg) {
    const cn = nodeMap.get(`county:${county}`); if (!cn) continue
    for (const [scheme, eData] of cData.schemes) {
      const sn = nodeMap.get(`scheme:${scheme}`); if (!sn) continue
      const mid = new THREE.Vector3().lerpVectors(sn.position, cn.position, 0.5)
      mid.multiplyScalar(0.55)
      mid.y += ((ei * 7) % 11 - 5) * 1.8
      edges.push({
        fromId: sn.id, toId: cn.id, count: eData.count, exposed: eData.exposed,
        color: SCHEME_HEX[scheme] || 0xaaaaaa,
        curve: new THREE.QuadraticBezierCurve3(sn.position.clone(), mid, cn.position.clone()),
      })
      ei++
    }
  }

  // Weighted CDF for particle distribution (more $ = more particles)
  const totalEdgeExp = edges.reduce((s, e) => s + e.exposed, 0) || 1
  const edgeCDF: number[] = []
  let cdf = 0
  for (const e of edges) { cdf += e.exposed / totalEdgeExp; edgeCDF.push(cdf) }

  // Tooltip details
  const nodeDetails = new Map<string, { label: string; count: number; exposed: number; color: string }[]>()
  for (const [scheme, data] of schemeAgg) {
    nodeDetails.set(`scheme:${scheme}`,
      [...data.counties.entries()].sort((a, b) => b[1].exposed - a[1].exposed).slice(0, 8)
        .map(([c, d]) => ({ label: c, count: d.count, exposed: d.exposed, color: '#c0c8e0' })))
  }
  for (const [county, data] of countyAgg) {
    nodeDetails.set(`county:${county}`,
      [...data.schemes.entries()].sort((a, b) => b[1].exposed - a[1].exposed)
        .map(([s, d]) => ({ label: SCHEME_LABELS[s] || s.replace(/_/g, ' '), count: d.count, exposed: d.exposed, color: SCHEME_COLORS[s] || '#aaa' })))
  }

  return { nodes: allNodes, edges, nodeMap, totalCases: cases.length, totalExposed,
    countyCount: countyList.length, schemeCount: schemeList.length, nodeDetails, edgeCDF,
    schemeNodeCount: schemeNodes.length }
}

/* ═══════════════════════════════════════════════════════════════
   Three.js helpers
   ═══════════════════════════════════════════════════════════════ */

function makeGlowTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,255,255,0.7)')
  gr.addColorStop(0.4, 'rgba(255,255,255,0.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function makeRingTex(): THREE.CanvasTexture {
  const s = 256; const c = document.createElement('canvas'); c.width = c.height = s
  const g = c.getContext('2d')!; const mid = s / 2; const r = s * 0.38
  for (let off = -8; off <= 8; off++) {
    const a = Math.max(0, 1 - Math.abs(off) / 8) * 0.6
    g.beginPath(); g.arc(mid, mid, r + off, 0, Math.PI * 2)
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.5; g.stroke()
  }
  return new THREE.CanvasTexture(c)
}

function makeTextSprite(text: string, color: string, bold: boolean): { sprite: THREE.Sprite; tex: THREE.CanvasTexture; mat: THREE.SpriteMaterial } {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64
  const g = c.getContext('2d')!
  g.font = `${bold ? 'bold ' : ''}${bold ? 28 : 22}px system-ui, -apple-system, sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 8
  g.fillStyle = color; g.fillText(text, 256, 32)
  const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat); sprite.scale.set(bold ? 18 : 14, bold ? 2.2 : 1.8, 1)
  return { sprite, tex, mat }
}

/* ═══════════════════════════════════════════════════════════════
   Animated counter component
   ═══════════════════════════════════════════════════════════════ */

function AnimVal({ value, fmt }: { value: number; fmt: (n: number) => string }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const start = prev.current; const end = value
    if (Math.abs(start - end) < 0.01) return
    const dur = 1400; const t0 = performance.now()
    let raf: number
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / dur)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(start + (end - start) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = end
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span>{fmt(display)}</span>
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function WebOfFraudTab() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedRef = useRef<string | null>(null)
  const hoveredRef = useRef<string | null>(null)

  const { data } = useCases({ limit: 1000, offset: 0 })
  const network = useMemo(() => data?.cases?.length ? buildFraudNetwork(data.cases) : null, [data])

  useEffect(() => { selectedRef.current = selectedId }, [selectedId])

  // ── Compute rich detail when a node is selected ────────
  const selectedDetail: SelectedDetail | null = useMemo(() => {
    if (!selectedId || !data?.cases?.length) return null
    const isScheme = selectedId.startsWith('scheme:')
    const key = selectedId.replace(/^(scheme|county):/, '')
    const filtered = data.cases.filter((c: any) => isScheme ? c.scheme_type === key : c.county === key)
    if (!filtered.length) return null

    const totalExposed = filtered.reduce((s: number, c: any) => s + (c.amount_exposed ?? 0), 0)
    const totalRecovered = filtered.reduce((s: number, c: any) => s + (c.amount_recovered ?? 0), 0)
    const totalLost = totalExposed - totalRecovered
    const recoveryRate = totalExposed > 0 ? (totalRecovered / totalExposed) * 100 : 0

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    for (const c of filtered) { const s = c.status || 'unknown'; statusCounts[s] = (statusCounts[s] || 0) + 1 }
    const statusBreakdown = Object.entries(statusCounts)
      .map(([s, count]) => ({ label: STATUS_LABEL[s] || s, count, pct: Math.round((count / filtered.length) * 100), color: STATUS_COLOR[s] || '#666' }))
      .sort((a, b) => b.count - a.count)

    // Breakdown by connected dimension
    const bMap = new Map<string, { count: number; exposed: number }>()
    for (const c of filtered) {
      const k = isScheme ? c.county : c.scheme_type
      if (!bMap.has(k)) bMap.set(k, { count: 0, exposed: 0 })
      const d = bMap.get(k)!; d.count++; d.exposed += c.amount_exposed ?? 0
    }
    const maxB = Math.max(...[...bMap.values()].map(d => d.exposed), 1)
    const breakdown = [...bMap.entries()].sort((a, b) => b[1].exposed - a[1].exposed).slice(0, 10)
      .map(([k, d]) => ({
        label: isScheme ? k : (SCHEME_LABELS[k] || k.replace(/_/g, ' ')),
        count: d.count, exposed: d.exposed, pct: Math.round((d.exposed / maxB) * 100),
        color: isScheme ? '#c0c8e0' : (SCHEME_COLORS[k] || '#aaa'),
      }))

    // Dates
    const dates = filtered.map((c: any) => c.date_filed).filter(Boolean).sort()
    // Largest case
    const sorted = [...filtered].sort((a: any, b: any) => (b.amount_exposed ?? 0) - (a.amount_exposed ?? 0))

    return {
      type: isScheme ? 'Fraud Scheme' : 'County',
      label: isScheme ? (SCHEME_LABELS[key] || key.replace(/_/g, ' ')) : key,
      cssColor: isScheme ? (SCHEME_COLORS[key] || '#aaa') : '#c0c8e0',
      isScheme,
      totalExposed, totalRecovered, totalLost, recoveryRate,
      caseCount: filtered.length, connectedCount: bMap.size,
      avgCaseValue: totalExposed / filtered.length,
      largestCase: { title: sorted[0]?.title || 'N/A', amount: sorted[0]?.amount_exposed ?? 0 },
      dateRange: { earliest: dates[0] || 'N/A', latest: dates[dates.length - 1] || 'N/A' },
      statusBreakdown, breakdown,
    }
  }, [selectedId, data])

  /* ── Three.js scene ─────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || !network) return
    const container = containerRef.current
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const particleCount = isMobile ? 320 : PARTICLE_N
    while (container.firstChild) container.removeChild(container.firstChild)
    const W = container.offsetWidth, H = container.offsetHeight
    const dispose: { dispose(): void }[] = []

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(BG)
    scene.fog = new THREE.FogExp2(BG, 0.0025)
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 800)
    camera.position.set(0, 30, 155)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.dampingFactor = 0.05
    controls.minDistance = 55; controls.maxDistance = 250
    controls.autoRotate = true; controls.autoRotateSpeed = 0.35; controls.enablePan = false

    // Lighting
    scene.add(new THREE.AmbientLight(0x2a3a5c, 0.7))
    const kl = new THREE.PointLight(0x6688cc, 1.8, 250); kl.position.set(40, 60, 50); scene.add(kl)
    const rl = new THREE.PointLight(0x4455aa, 0.7, 200); rl.position.set(-50, -30, -50); scene.add(rl)

    // ── Starfield ──────────────────────────────
    const starN = 3000; const starP = new Float32Array(starN * 3)
    for (let i = 0; i < starN; i++) { starP[i*3]=(Math.random()-0.5)*500; starP[i*3+1]=(Math.random()-0.5)*500; starP[i*3+2]=(Math.random()-0.5)*500 }
    const starG = new THREE.BufferGeometry(); starG.setAttribute('position', new THREE.BufferAttribute(starP, 3))
    const starM = new THREE.PointsMaterial({ color: 0x3a4a6a, size: 0.35, transparent: true, opacity: 0.5, depthWrite: false })
    scene.add(new THREE.Points(starG, starM)); dispose.push(starG, starM)

    // ── Nebula ambient clouds ──────────────────
    const nebN = 250; const nebP = new Float32Array(nebN * 3); const nebC = new Float32Array(nebN * 3)
    for (let i = 0; i < nebN; i++) {
      const a = Math.random() * Math.PI * 2; const r = 15 + Math.random() * 55
      nebP[i*3] = r * Math.cos(a); nebP[i*3+1] = (Math.random()-0.5)*30; nebP[i*3+2] = r * Math.sin(a)
      let near = new THREE.Color(0x334466)
      let best = 1e9
      for (const sn of network.nodes) {
        if (sn.type !== 'scheme') continue
        const dx = nebP[i*3]-sn.position.x, dz = nebP[i*3+2]-sn.position.z
        const d = Math.sqrt(dx*dx+dz*dz)
        if (d < best) { best = d; near = new THREE.Color(sn.color) }
      }
      nebC[i*3]=near.r; nebC[i*3+1]=near.g; nebC[i*3+2]=near.b
    }
    const nebG = new THREE.BufferGeometry(); nebG.setAttribute('position', new THREE.BufferAttribute(nebP, 3))
    nebG.setAttribute('color', new THREE.BufferAttribute(nebC, 3))
    const nebM = new THREE.PointsMaterial({ size: 4, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.06, depthWrite: false, sizeAttenuation: true })
    const nebula = new THREE.Points(nebG, nebM); scene.add(nebula); dispose.push(nebG, nebM)

    // ── Guide rings ────────────────────────────
    for (const r of [INNER_R, OUTER_R]) {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 128; i++) { const a = (i/128)*Math.PI*2; pts.push(new THREE.Vector3(r*Math.cos(a),0,r*Math.sin(a))) }
      const rg = new THREE.BufferGeometry().setFromPoints(pts)
      const rm = new THREE.LineBasicMaterial({ color: 0x141e38, transparent: true, opacity: 0.35 })
      scene.add(new THREE.Line(rg, rm)); dispose.push(rg, rm)
    }

    // ── Central orb ────────────────────────────
    const coreG = new THREE.SphereGeometry(3.5, 32, 32)
    const coreM = new THREE.MeshPhongMaterial({ color: 0xff3344, emissive: 0xff2233, emissiveIntensity: 0.6, transparent: true, opacity: 0.35, shininess: 80 })
    const core = new THREE.Mesh(coreG, coreM); scene.add(core); dispose.push(coreG, coreM)
    const glowTex = makeGlowTex(); dispose.push(glowTex)
    const coreGM = new THREE.SpriteMaterial({ map: glowTex, color: 0xff3344, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.2, depthWrite: false })
    const coreGlow = new THREE.Sprite(coreGM); coreGlow.scale.set(28, 28, 1); scene.add(coreGlow); dispose.push(coreGM)

    // ── Nodes ──────────────────────────────────
    const hitTargets: THREE.Mesh[] = []
    const maxExp = Math.max(...network.nodes.map(n => n.exposed), 1)
    interface NM { sphere: THREE.Mesh; sMat: THREE.MeshPhongMaterial; glow: THREE.Sprite; gMat: THREE.SpriteMaterial; label: THREE.Sprite; lMat: THREE.SpriteMaterial; nodeId: string; isScheme: boolean }
    const nm: NM[] = []

    for (const node of network.nodes) {
      const isS = node.type === 'scheme'
      const sc = Math.log10(node.exposed + 1) / Math.log10(maxExp + 1)
      const sz = isS ? 2.5 + sc * 3 : 1.5 + sc * 2

      const sg = new THREE.SphereGeometry(sz, isS ? 24 : 16, isS ? 24 : 16)
      const sm = new THREE.MeshPhongMaterial({ color: node.color, emissive: node.color, emissiveIntensity: isS ? 0.45 : 0.15, transparent: true, opacity: isS ? 0.95 : 0.8, shininess: isS ? 80 : 30 })
      const mesh = new THREE.Mesh(sg, sm); mesh.position.copy(node.position); mesh.userData = { nodeId: node.id }
      scene.add(mesh); hitTargets.push(mesh); dispose.push(sg, sm)

      const gm = new THREE.SpriteMaterial({ map: glowTex, color: node.color, blending: THREE.AdditiveBlending, transparent: true, opacity: isS ? 0.4 : 0.15, depthWrite: false })
      const gl = new THREE.Sprite(gm); gl.scale.set(sz*5, sz*5, 1); gl.position.copy(node.position); scene.add(gl); dispose.push(gm)

      const { sprite: lb, tex: lt, mat: lm } = makeTextSprite(node.label, isS ? '#ffffff' : '#8899bb', isS)
      lb.position.copy(node.position); lb.position.y += sz + 2.5; scene.add(lb); dispose.push(lt, lm)

      // Amount label under scheme nodes
      if (isS) {
        const { sprite: al, tex: at, mat: am } = makeTextSprite(formatCurrency(node.exposed), '#ff6b6b', false)
        al.position.copy(node.position); al.position.y -= sz + 2; al.scale.set(10, 1.3, 1)
        scene.add(al); dispose.push(at, am)
      }

      nm.push({ sphere: mesh, sMat: sm, glow: gl, gMat: gm, label: lb, lMat: lm, nodeId: node.id, isScheme: isS })
    }

    // ── Edges ──────────────────────────────────
    const maxEdge = Math.max(...network.edges.map(e => e.exposed), 1)
    interface EM { line: THREE.Line; mat: THREE.LineBasicMaterial; fromId: string; toId: string; baseOp: number }
    const em: EM[] = []

    // Sort to identify top 20% for "highway" glow
    const sortedEdges = [...network.edges].sort((a, b) => b.exposed - a.exposed)
    const topN = Math.ceil(sortedEdges.length * 0.2)
    const topSet = new Set(sortedEdges.slice(0, topN))

    for (const edge of network.edges) {
      const pts = edge.curve.getPoints(40)
      const eg = new THREE.BufferGeometry().setFromPoints(pts)
      const op = 0.06 + (edge.exposed / maxEdge) * 0.25
      const eMat = new THREE.LineBasicMaterial({ color: edge.color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })
      const line = new THREE.Line(eg, eMat); scene.add(line); dispose.push(eg, eMat)
      em.push({ line, mat: eMat, fromId: edge.fromId, toId: edge.toId, baseOp: op })

      // Highway glow for top edges
      if (topSet.has(edge)) {
        const hg = new THREE.BufferGeometry().setFromPoints(pts)
        const hm = new THREE.LineBasicMaterial({ color: edge.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
        scene.add(new THREE.Line(hg, hm)); dispose.push(hg, hm)
        // Midpoint glow sprite
        const mp = edge.curve.getPoint(0.5)
        const mgm = new THREE.SpriteMaterial({ map: glowTex, color: edge.color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.12, depthWrite: false })
        const mgs = new THREE.Sprite(mgm); mgs.position.copy(mp); mgs.scale.set(10, 10, 1); scene.add(mgs); dispose.push(mgm)
      }
    }

    // ── Flowing particles (weighted) ───────────
    const pPos = new Float32Array(particleCount * 3); const pCol = new Float32Array(particleCount * 3)
    function sampleEdge(): number {
      const r = Math.random()
      for (let i = 0; i < network.edgeCDF.length; i++) { if (r <= network.edgeCDF[i]) return i }
      return network.edges.length - 1
    }
    const pState = Array.from({ length: particleCount }, () => {
      const ei = sampleEdge()
      return { ei, t: Math.random(), speed: 0.0015 + Math.random() * 0.004 }
    })
    for (let i = 0; i < particleCount; i++) {
      const ps = pState[i]; const pt = network.edges[ps.ei].curve.getPoint(ps.t)
      pPos[i*3]=pt.x; pPos[i*3+1]=pt.y; pPos[i*3+2]=pt.z
      const col = new THREE.Color(network.edges[ps.ei].color)
      pCol[i*3]=col.r; pCol[i*3+1]=col.g; pCol[i*3+2]=col.b
    }
    const pGeom = new THREE.BufferGeometry()
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeom.setAttribute('color', new THREE.BufferAttribute(pCol, 3))
    const pMat = new THREE.PointsMaterial({ size: 1.3, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true })
    scene.add(new THREE.Points(pGeom, pMat)); dispose.push(pGeom, pMat)

    // ── Pulse rings ────────────────────────────
    const ringTex = makeRingTex(); dispose.push(ringTex)
    interface PR { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; progress: number }
    const pulses: PR[] = []
    let lastPulse = 0

    // ── Interaction ────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mVec = new THREE.Vector2(-999, -999)
    let mX = 0, mY = 0
    const updatePointer = (clientX: number, clientY: number) => {
      const r = container.getBoundingClientRect()
      mVec.x = ((clientX - r.left) / r.width) * 2 - 1
      mVec.y = -((clientY - r.top) / r.height) * 2 + 1
      mX = clientX - r.left
      mY = clientY - r.top
      if (hoveredRef.current) setTooltipPos({ x: mX, y: mY })
    }
    const onPointerMove = (e: PointerEvent) => { updatePointer(e.clientX, e.clientY) }
    const onPointerDown = (e: PointerEvent) => { updatePointer(e.clientX, e.clientY) }
    const onClick = () => {
      raycaster.setFromCamera(mVec, camera)
      const hit = raycaster.intersectObjects(hitTargets)
      if (hit.length) { const nid = hit[0].object.userData.nodeId as string; setSelectedId(prev => prev === nid ? null : nid) }
      else setSelectedId(null)
    }
    const onLeave = () => { mVec.set(-999, -999); hoveredRef.current = null; setTooltip(null) }
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('click', onClick)
    container.addEventListener('pointerleave', onLeave)

    // ── Animation ──────────────────────────────
    const clock = new THREE.Clock(); const t0 = performance.now()
    let frameN = 0; let animId: number

    const loop = () => {
      animId = requestAnimationFrame(loop)
      const elapsed = clock.getElapsedTime()
      const intro = Math.min(1, (performance.now()-t0)/2200)
      const ease = 1 - Math.pow(1-intro, 3)
      frameN++; controls.update()

      if (intro < 1) { camera.position.z = 155-ease*35; camera.position.y = 30-ease*8 }

      // Central orb pulse
      coreM.opacity = 0.3 + Math.sin(elapsed*2)*0.1
      coreGM.opacity = 0.18 + Math.sin(elapsed*2)*0.06
      core.scale.setScalar(1 + Math.sin(elapsed*1.5)*0.06)

      // Nebula slow rotation
      nebula.rotation.y += 0.00015

      // Scheme node breathing
      for (let i = 0; i < nm.length; i++) { if (nm[i].isScheme) nm[i].sphere.scale.setScalar(1 + Math.sin(elapsed*1.2+i*0.9)*0.04) }

      // Spawn pulse rings from scheme nodes
      if (elapsed - lastPulse > 1.2) {
        lastPulse = elapsed
        const si = Math.floor(Math.random() * network.schemeNodeCount)
        const sn = network.nodes[si]
        if (sn?.type === 'scheme') {
          const pm = new THREE.SpriteMaterial({ map: ringTex, color: sn.color, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.45, depthWrite: false })
          const ps = new THREE.Sprite(pm); ps.position.copy(sn.position); ps.scale.set(1,1,1); scene.add(ps)
          pulses.push({ sprite: ps, mat: pm, progress: 0 })
        }
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.progress += 0.007
        const s = 5 + p.progress * 35; p.sprite.scale.set(s, s, 1)
        p.mat.opacity = 0.4 * (1 - p.progress)
        if (p.progress >= 1) { scene.remove(p.sprite); p.mat.dispose(); pulses.splice(i, 1) }
      }

      // Selection highlight
      const sel = selectedRef.current
      let connSet: Set<string> | null = null
      if (sel) { connSet = new Set([sel]); for (const e of network.edges) { if (e.fromId === sel || e.toId === sel) { connSet.add(e.fromId); connSet.add(e.toId) } } }
      for (const n of nm) {
        const on = !sel || connSet!.has(n.nodeId)
        n.sMat.opacity += ((on ? (n.isScheme ? 0.95 : 0.8) : 0.07) - n.sMat.opacity) * 0.08
        n.gMat.opacity += ((on ? (n.isScheme ? 0.4 : 0.15) : 0.02) - n.gMat.opacity) * 0.08
        n.lMat.opacity += ((on ? 1 : 0.08) - n.lMat.opacity) * 0.08
      }
      for (const e of em) {
        const on = !sel || e.fromId === sel || e.toId === sel
        e.mat.opacity += ((on ? e.baseOp : 0.008) - e.mat.opacity) * 0.08
      }

      // Hover raycast
      if (frameN % 3 === 0) {
        raycaster.setFromCamera(mVec, camera)
        const hit = raycaster.intersectObjects(hitTargets)
        if (hit.length) {
          const nid = hit[0].object.userData.nodeId as string
          container.style.cursor = 'pointer'
          if (hoveredRef.current !== nid) {
            hoveredRef.current = nid
            const node = network.nodeMap.get(nid)
            if (node) { setTooltip({ type: node.type, id: node.id, label: node.label, count: node.count, exposed: node.exposed, details: network.nodeDetails.get(nid) || [] }); setTooltipPos({ x: mX, y: mY }) }
          }
        } else if (hoveredRef.current) { hoveredRef.current = null; setTooltip(null); container.style.cursor = 'grab' }
      }

      // Flowing particles
      for (let i = 0; i < particleCount; i++) {
        const ps = pState[i]; ps.t += ps.speed
        if (ps.t > 1) { ps.t -= 1; ps.ei = sampleEdge(); const col = new THREE.Color(network.edges[ps.ei].color); pCol[i*3]=col.r; pCol[i*3+1]=col.g; pCol[i*3+2]=col.b }
        const pt = network.edges[ps.ei].curve.getPoint(ps.t)
        pPos[i*3]=pt.x; pPos[i*3+1]=pt.y; pPos[i*3+2]=pt.z
      }
      pGeom.attributes.position.needsUpdate = true; pGeom.attributes.color.needsUpdate = true
      renderer.render(scene, camera)
    }
    loop()

    const onResize = () => { const w = container.offsetWidth, h = container.offsetHeight; camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w, h) }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId); window.removeEventListener('resize', onResize)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('click', onClick)
      container.removeEventListener('pointerleave', onLeave)
      pulses.forEach(p => { scene.remove(p.sprite); p.mat.dispose() })
      dispose.forEach(d => d.dispose()); renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [network])

  /* ── Loading ─────────────────────────────────────────────── */
  if (!network) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#060a14' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-300/50 text-sm tracking-wide">Building fraud network...</p>
        </div>
      </div>
    )
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="relative h-full w-full touch-none select-none" style={{ background: '#060a14' }}>
      <div ref={containerRef} className="absolute inset-0 touch-none" style={{ touchAction: 'none' }} />

      {/* ── Stats panel (top-left) ───────────────────── */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 pointer-events-none">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          className="rounded-xl md:rounded-2xl border border-white/[0.08] p-3 md:p-5 min-w-[180px] md:min-w-[230px]"
          style={{ background: 'rgba(8,14,30,0.8)', backdropFilter: 'blur(16px)' }}
        >
          <h2 className="text-white font-bold text-base md:text-lg tracking-tight">Web of Fraud</h2>
          <p className="text-blue-300/40 text-[10px] md:text-[11px] mt-0.5 mb-3 md:mb-4">California Fraud Intelligence Network</p>
          <div className="space-y-3">
            <div>
              <p className="text-blue-300/30 text-[10px] uppercase tracking-widest">Total Exposed</p>
              <p className="text-red-400 font-bold text-xl md:text-2xl tabular-nums"><AnimVal value={network.totalExposed} fmt={formatCurrency} /></p>
            </div>
            <div className="flex gap-5">
              <div><p className="text-blue-300/30 text-[10px] uppercase tracking-widest">Cases</p>
                <p className="text-white font-semibold tabular-nums"><AnimVal value={network.totalCases} fmt={n => Math.round(n).toLocaleString()} /></p></div>
              <div><p className="text-blue-300/30 text-[10px] uppercase tracking-widest">Counties</p>
                <p className="text-white font-semibold">{network.countyCount}</p></div>
              <div><p className="text-blue-300/30 text-[10px] uppercase tracking-widest">Schemes</p>
                <p className="text-white font-semibold">{network.schemeCount}</p></div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            <p className="text-blue-300/25 text-[10px] leading-relaxed">
              {selectedId ? 'Click node again to deselect' : 'Inner ring = scheme types \u00B7 Outer ring = counties'}
            </p>
            <p className="text-blue-300/25 text-[10px]">Drag to rotate \u00B7 Scroll to zoom \u00B7 Click to inspect</p>
          </div>
        </motion.div>
      </div>

      {/* ── Detail panel (right side, on selection) ──── */}
      <AnimatePresence>
        {selectedId && selectedDetail && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-2 right-2 left-2 md:left-auto md:top-4 md:right-4 z-20 w-auto md:w-[310px] max-w-md md:max-w-none max-h-[calc(100%-1rem)] md:max-h-[calc(100%-2rem)] overflow-y-auto scrollbar-hide overscroll-contain pointer-events-auto pb-safe"
          >
            <div className="rounded-xl md:rounded-2xl border border-white/[0.08] p-4 md:p-5" style={{ background: 'rgba(8,14,30,0.88)', backdropFilter: 'blur(20px)' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                    style={{ background: `${selectedDetail.cssColor}20`, color: selectedDetail.cssColor }}>
                    {selectedDetail.type}
                  </span>
                  <h3 className="text-white font-bold text-base mt-1.5 leading-snug">{selectedDetail.label}</h3>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-white/30 hover:text-white/70 active:text-white text-xl leading-none transition-colors pointer-events-auto p-2 min-w-[44px] min-h-[44px] touch-target -mr-2 -mt-2" aria-label="Close panel">&times;</button>
              </div>

              {/* Money flow */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-blue-300/30 text-[10px] uppercase tracking-widest">Exposed</span>
                  <span className="text-red-400 font-bold text-lg tabular-nums">{formatCurrency(selectedDetail.totalExposed)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-blue-300/30 text-[10px] uppercase tracking-widest">Recovered</span>
                  <span className="text-green-400 font-bold tabular-nums">{formatCurrency(selectedDetail.totalRecovered)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-blue-300/30 text-[10px] uppercase tracking-widest">Unrecovered</span>
                  <span className="text-red-300/80 font-bold tabular-nums">{formatCurrency(selectedDetail.totalLost)}</span>
                </div>
                {/* Recovery gauge */}
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-red-400/60">Lost {(100 - selectedDetail.recoveryRate).toFixed(1)}%</span>
                    <span className="text-green-400/60">Recovered {selectedDetail.recoveryRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${selectedDetail.recoveryRate}%`, background: 'linear-gradient(to right, #22c55e, #4ade80)' }} />
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-blue-300/25 text-[9px] uppercase">Cases</p>
                  <p className="text-white font-semibold text-sm tabular-nums">{selectedDetail.caseCount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-blue-300/25 text-[9px] uppercase">Avg Case</p>
                  <p className="text-white font-semibold text-sm tabular-nums">{formatCurrency(selectedDetail.avgCaseValue)}</p>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-blue-300/25 text-[9px] uppercase">{selectedDetail.isScheme ? 'Counties' : 'Schemes'}</p>
                  <p className="text-white font-semibold text-sm">{selectedDetail.connectedCount}</p>
                </div>
              </div>

              {/* Largest case */}
              <div className="mb-5 rounded-lg p-3" style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.1)' }}>
                <p className="text-red-400/50 text-[9px] uppercase tracking-wider mb-1">Largest Single Case</p>
                <p className="text-white text-xs leading-snug truncate">{selectedDetail.largestCase.title}</p>
                <p className="text-red-400 font-bold text-sm mt-0.5">{formatCurrency(selectedDetail.largestCase.amount)}</p>
              </div>

              {/* Case status */}
              <div className="mb-5">
                <p className="text-blue-300/30 text-[10px] uppercase tracking-widest mb-2">Case Status</p>
                <div className="space-y-1.5">
                  {selectedDetail.statusBreakdown.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-blue-200/50 text-[11px] w-[100px] truncate">{s.label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full" style={{ background: s.color }} />
                      </div>
                      <span className="text-blue-300/30 text-[10px] tabular-nums w-8 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="mb-3">
                <p className="text-blue-300/30 text-[10px] uppercase tracking-widest mb-2">
                  {selectedDetail.isScheme ? 'Where The Money Goes' : 'Fraud Scheme Breakdown'}
                </p>
                <div className="space-y-2">
                  {selectedDetail.breakdown.map((b, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                          <span className="text-blue-200/55 text-[11px] truncate">{b.label}</span>
                        </div>
                        <span className="text-red-400/60 text-[11px] tabular-nums flex-shrink-0 ml-2">{formatCurrency(b.exposed)}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                          className="h-full rounded-full" style={{ background: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="pt-3 border-t border-white/[0.05] flex justify-between">
                <div><p className="text-blue-300/25 text-[9px] uppercase">Earliest</p><p className="text-blue-200/50 text-[11px] tabular-nums">{selectedDetail.dateRange.earliest}</p></div>
                <div className="text-right"><p className="text-blue-300/25 text-[9px] uppercase">Latest</p><p className="text-blue-200/50 text-[11px] tabular-nums">{selectedDetail.dateRange.latest}</p></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend (bottom-right, hidden when detail panel open) ── */}
      <AnimatePresence>
        {!selectedId && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: 0.7, duration: 0.4 }}
            className="absolute bottom-4 right-2 md:right-4 z-10 pointer-events-none pb-safe"
          >
            <div className="rounded-lg md:rounded-xl border border-white/[0.08] p-2.5 md:p-3.5 max-w-[160px] md:max-w-none" style={{ background: 'rgba(8,14,30,0.75)', backdropFilter: 'blur(16px)' }}>
              <p className="text-blue-300/35 text-[10px] uppercase tracking-widest mb-2.5">Fraud Schemes</p>
              <div className="space-y-1.5">
                {Object.entries(SCHEME_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SCHEME_COLORS[key] || '#aaa', boxShadow: `0 0 8px ${SCHEME_COLORS[key] || '#aaa'}50` }} />
                    <span className="text-blue-200/50 text-[11px]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#c0c8e0' }} />
                <span className="text-blue-200/50 text-[11px]">County Node</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500" style={{ boxShadow: '0 0 8px rgba(255,50,50,0.5)' }} />
                <span className="text-blue-200/50 text-[11px]">Core (Total Fraud)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tooltip ──────────────────────────────────── */}
      <AnimatePresence>
        {tooltip && !selectedId && (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.12 }}
            className="absolute z-50 pointer-events-none"
            style={{ left: Math.min(tooltipPos.x+18, (containerRef.current?.offsetWidth ?? 800)-290), top: tooltipPos.y-14, transform: 'translateY(-100%)' }}
          >
            <div className="rounded-xl border border-white/[0.1] p-4 min-w-[240px] max-w-[300px]" style={{ background: 'rgba(10,16,34,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: tooltip.type === 'scheme' ? `${SCHEME_COLORS[tooltip.id.replace('scheme:', '')] || '#666'}25` : 'rgba(192,200,224,0.08)', color: tooltip.type === 'scheme' ? SCHEME_COLORS[tooltip.id.replace('scheme:', '')] || '#aaa' : '#c0c8e0' }}>
                  {tooltip.type === 'scheme' ? 'Fraud Scheme' : 'County'}
                </span>
              </div>
              <p className="text-white font-bold text-sm leading-snug">{tooltip.label}</p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-red-400 font-bold text-xl tabular-nums">{formatCurrency(tooltip.exposed)}</span>
                <span className="text-blue-300/35 text-xs tabular-nums">{tooltip.count.toLocaleString()} cases</span>
              </div>
              {tooltip.details.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1.5">
                  <p className="text-blue-300/30 text-[10px] uppercase tracking-widest">{tooltip.type === 'scheme' ? 'Top Counties' : 'Schemes'}</p>
                  {tooltip.details.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-blue-200/55 truncate">{d.label}</span>
                      </div>
                      <span className="text-red-400/60 text-[11px] tabular-nums flex-shrink-0 ml-3">{formatCurrency(d.exposed)}</span>
                    </div>
                  ))}
                  <p className="text-blue-300/20 text-[10px] mt-1">Click to see full breakdown</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
