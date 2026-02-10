'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { motion, AnimatePresence } from 'framer-motion'
import FraudQuoteBubble from './FraudQuoteBubble'

// Disco colors for flashing effect
const DISCO_COLORS = [
  0xF6B400, // California poppy
  0xFF7A18, // Sunset orange
  0xD72638, // Red
  0x1E6FFF, // Pacific blue
  0x8B5CF6, // Purple
  0xEC4899, // Pink
  0x14B8A6, // Teal
  0x2E5E4E, // Redwood green
]

interface DancingCharacterProps {
  position?: 'left' | 'right'
  size?: number
}

export default function DancingCharacter({ position = 'left', size = 300 }: DancingCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const discoLightsRef = useRef<THREE.PointLight[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = size
    const height = size * 1.5

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 100, 300)
    camera.lookAt(0, 80, 0)

    // Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Base lighting - brighter so model isn't black
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    directionalLight.position.set(5, 10, 7.5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Disco flashing lights - tight around the model for strong color wash
    const discoPositions = [
      [40, 100, 80], [80, 80, 40], [30, 120, 60],
      [-40, 90, 60], [-60, 110, 40], [0, 140, 100],
      [50, 60, -20], [-30, 70, 50],
    ]
    discoPositions.forEach((pos, i) => {
      const light = new THREE.PointLight(DISCO_COLORS[i % DISCO_COLORS.length], 5, 250)
      light.position.set(pos[0], pos[1], pos[2])
      scene.add(light)
      discoLightsRef.current.push(light)
    })

    // Ground plane (invisible, just for shadow)
    const groundGeometry = new THREE.PlaneGeometry(500, 500)
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Load FBX model
    const loader = new FBXLoader()
    const clock = new THREE.Clock()

    loader.load(
      '/models/dancing.fbx',
      (fbx) => {
        // Scale the model
        fbx.scale.setScalar(1)

        // Center the model
        const box = new THREE.Box3().setFromObject(fbx)
        const center = box.getCenter(new THREE.Vector3())
        fbx.position.sub(center)
        fbx.position.y = 0

        // Fix black model - force light gray base + emissive disco tint
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material]
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
                  mat.metalness = 0.1
                  mat.roughness = 0.5
                  // Force light base so disco colors show - any dark material becomes gray
                  const hex = mat.color.getHex()
                  if (hex < 0x333333) {
                    mat.color.setHex(0x666666)
                  }
                  mat.emissive = new THREE.Color(0x333333)
                  ;(mat as THREE.MeshStandardMaterial).emissiveIntensity = 0.3
                }
              })
            }
          }
        })

        // Store model ref for emissive disco pulse in animation loop
        ;(scene as THREE.Scene & { _discoModel?: THREE.Group })._discoModel = fbx

        scene.add(fbx)

        // Setup animation mixer
        if (fbx.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(fbx)
          const action = mixerRef.current.clipAction(fbx.animations[0])
          action.play()
        }

        setLoaded(true)
      },
      (progress) => {
        console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(0) + '%')
      },
      (err) => {
        console.error('Error loading FBX:', err)
        setError('Failed to load animation')
      }
    )

    // Animation loop with disco flashing
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      if (mixerRef.current) {
        mixerRef.current.update(delta)
      }

      // Disco flash - cycle colors every ~0.3 seconds
      discoLightsRef.current.forEach((light, i) => {
        const colorIndex = Math.floor(time * 4 + i * 0.5) % DISCO_COLORS.length
        light.color.setHex(DISCO_COLORS[colorIndex])
        light.intensity = 4 + Math.sin(time * 10 + i) * 2
      })

      // Pulse model emissive with disco colors so it glows
      const discoModel = (scene as THREE.Scene & { _discoModel?: THREE.Group })._discoModel
      if (discoModel) {
        const colorIndex = Math.floor(time * 4) % DISCO_COLORS.length
        discoModel.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material]
            mats.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial) {
                m.emissive.setHex(DISCO_COLORS[colorIndex])
                m.emissiveIntensity = 0.2 + Math.sin(time * 6) * 0.15
              }
            })
          }
        })
      }

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [size])

  const positionClass = position === 'left' 
    ? 'left-4 lg:left-[340px]' 
    : 'right-4'

  if (error) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position === 'left' ? -50 : 50 }}
        animate={{ opacity: loaded ? 1 : 0, x: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className={`fixed bottom-[200px] ${positionClass} z-20 pointer-events-none hidden lg:block`}
        style={{ width: size, height: size * 1.5 }}
      >
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
          }}
        />
        
        {/* Speech bubble - right at the head, rotating hilarious fraud quotes */}
        {loaded && <FraudQuoteBubble />}
      </motion.div>
    </AnimatePresence>
  )
}
