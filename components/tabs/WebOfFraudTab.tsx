'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useCases } from '@/hooks/useFraudData'
import { formatCurrency, SCHEME_COLORS, colors } from '@/lib/design-tokens'
import { motion, AnimatePresence } from 'framer-motion'

// Extended scheme colors for web
const SCHEME_PALETTE: Record<string, number> = {
  edd_unemployment: 0xf6b400,
  ppp_fraud: 0xff7a18,
  medi_cal: 0x1e6fff,
  telemedicine: 0x8b5cf6,
  pharmacy: 0x2e5e4e,
  substance_abuse: 0xd72638,
  homeless_program: 0x14b8a6,
  contract_fraud: 0xec4899,
}

function hexToThree(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export default function WebOfFraudTab() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<{ id: number; title: string; amount: number; scheme: string } | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  const { data } = useCases({ limit: 500, offset: 0 })

  useEffect(() => {
    if (!containerRef.current || !data?.cases?.length) return

    const container = containerRef.current
    const width = container.offsetWidth
    const height = container.offsetHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf9faf7)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 120)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 60
    controls.maxDistance = 200

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(50, 50, 50)
    scene.add(dir)

    const cases = [...data.cases]
      .sort((a, b) => (b.amount_exposed ?? 0) - (a.amount_exposed ?? 0))
      .slice(0, 200)
    const nodes: { mesh: THREE.Mesh; case: (typeof cases)[0] }[] = []

    // Arrange nodes in a 3D sphere/carousel
    const r = 45
    for (let i = 0; i < cases.length; i++) {
      const c = cases[i]
      const amt = c.amount_exposed ?? 0
      const phi = Math.acos(-1 + (2 * i) / cases.length)
      const theta = Math.sqrt(cases.length * Math.PI) * phi
      const x = r * Math.cos(theta) * Math.sin(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      const z = r * Math.cos(phi)

      const size = 0.8 + Math.min(4, Math.log10(amt + 1) / 2)
      const geom = new THREE.SphereGeometry(size, 12, 12)
      const schemeHex = SCHEME_PALETTE[c.scheme_type] ?? hexToThree(SCHEME_COLORS[c.scheme_type] ?? colors.california.poppy)
      const mat = new THREE.MeshPhongMaterial({
        color: schemeHex,
        emissive: schemeHex,
        emissiveIntensity: 0.15,
        shininess: 30,
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(x, y, z)
      mesh.userData = { caseId: c.id, case: c }
      scene.add(mesh)
      nodes.push({ mesh, case: c })
    }

    // Add edges between related cases (same county or scheme) - limit for performance
    const edges: THREE.Line[] = []
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      opacity: 0.25,
      transparent: true,
    })
    const maxEdgesPerNode = 4
    const connCount = new Map<number, number>()

    for (let i = 0; i < nodes.length; i++) {
      const ni = connCount.get(i) ?? 0
      if (ni >= maxEdgesPerNode) continue
      for (let j = i + 1; j < nodes.length; j++) {
        const nj = connCount.get(j) ?? 0
        if (nj >= maxEdgesPerNode) continue
        const a = nodes[i].case
        const b = nodes[j].case
        const sameCounty = a.county === b.county && a.county
        const sameScheme = a.scheme_type === b.scheme_type
        if (sameCounty || sameScheme) {
          const segGeom = new THREE.BufferGeometry()
          const segPos = new Float32Array([
            nodes[i].mesh.position.x, nodes[i].mesh.position.y, nodes[i].mesh.position.z,
            nodes[j].mesh.position.x, nodes[j].mesh.position.y, nodes[j].mesh.position.z,
          ])
          segGeom.setAttribute('position', new THREE.BufferAttribute(segPos, 3))
          const line = new THREE.Line(segGeom, lineMat)
          scene.add(line)
          edges.push(line)
          connCount.set(i, ni + 1)
          connCount.set(j, nj + 1)
          if (ni + 1 >= maxEdgesPerNode) break
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / height) * 2 + 1
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(nodes.map((n) => n.mesh))
      if (intersects.length > 0) {
        const obj = intersects[0].object
        const ud = obj.userData as { caseId: number; case: (typeof cases)[0] }
        if (ud.case) {
          setHovered({
            id: ud.case.id,
            title: ud.case.title || 'Case',
            amount: ud.case.amount_exposed ?? 0,
            scheme: ud.case.scheme_type,
          })
        }
      }
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('click', handleClick)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(nodes.map((n) => n.mesh))
      if (intersects.length > 0) {
        const obj = intersects[0].object
        const ud = obj.userData as { caseId: number; case: (typeof cases)[0] }
        if (ud.case && (!hovered || hovered.id !== ud.case.id)) {
          setHovered({
            id: ud.case.id,
            title: ud.case.title || 'Case',
            amount: ud.case.amount_exposed ?? 0,
            scheme: ud.case.scheme_type,
          })
        }
      } else if (hovered) {
        setHovered(null)
      }
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('click', handleClick)
      nodes.forEach((n) => {
        n.mesh.geometry.dispose()
        ;(n.mesh.material as THREE.Material).dispose()
        scene.remove(n.mesh)
      })
      lineMat.dispose()
      edges.forEach((e) => {
        e.geometry.dispose()
        scene.remove(e)
      })
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [data])

  if (!data?.cases?.length) {
    return (
      <div className="h-full flex items-center justify-center bg-california-sand">
        <div className="text-center text-text-secondary">
          <p>Loading fraud web...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-california-sand">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur rounded-xl px-4 py-2 shadow-lg border border-california-border">
          <p className="text-sm font-semibold text-text-primary">Web of Fraud</p>
          <p className="text-xs text-text-secondary">
            {data.total} cases • Drag to rotate • Hover/click nodes
          </p>
        </div>
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute z-50 pointer-events-none"
            style={{ left: mouse.x + 16, top: mouse.y - 12, transform: 'translateY(-100%)' }}
          >
            <div className="bg-white rounded-xl px-3 py-2 shadow-xl border border-california-border max-w-[220px]">
              <p className="text-xs font-medium text-text-primary line-clamp-2">{hovered.title}</p>
              <p className="text-california-poppy font-bold text-lg mt-1">
                {formatCurrency(hovered.amount)} in fraud! 💰
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-california-border">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: SCHEME_COLORS[hovered.scheme] || colors.california.poppy,
                  }}
                />
                <span className="text-text-tertiary text-xs capitalize">
                  {hovered.scheme.replace(/_/g, ' ')}
                </span>
              </div>
              <div
                className="absolute top-full left-4 w-0 h-0
                  border-l-[6px] border-r-[6px] border-t-[6px]
                  border-l-transparent border-r-transparent border-t-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
