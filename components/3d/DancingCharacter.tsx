'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { motion, AnimatePresence } from 'framer-motion'

interface DancingCharacterProps {
  position?: 'left' | 'right'
  size?: number
}

export default function DancingCharacter({ position = 'left', size = 300 }: DancingCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 7.5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Golden rim light for California theme
    const rimLight = new THREE.DirectionalLight(0xF6B400, 0.5)
    rimLight.position.set(-5, 5, -5)
    scene.add(rimLight)

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

        // Enable shadows
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            // Add a nice material if needed
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material]
              materials.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
                  mat.metalness = 0.3
                  mat.roughness = 0.7
                }
              })
            }
          }
        })

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

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      const delta = clock.getDelta()
      if (mixerRef.current) {
        mixerRef.current.update(delta)
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
    ? 'left-0 lg:left-[320px]' 
    : 'right-0'

  if (error) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position === 'left' ? -50 : 50 }}
        animate={{ opacity: loaded ? 1 : 0, x: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
        className={`fixed bottom-0 ${positionClass} z-5 pointer-events-none hidden lg:block`}
        style={{ width: size, height: size * 1.5 }}
      >
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ 
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
          }}
        />
        
        {/* Speech bubble */}
        {loaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg"
          >
            <p className="text-xs font-medium text-text-primary whitespace-nowrap">
              $921B in fraud! 💰
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
              border-l-8 border-r-8 border-t-8 
              border-l-transparent border-r-transparent border-t-white" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
