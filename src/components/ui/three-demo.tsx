
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei'
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

function AnimatedSphere({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Sphere args={[1, 100, 200]} scale={2} position={position}>
      <MeshDistortMaterial
        color={color}
        distort={0.3}
        speed={1.5}
        roughness={0}
      />
    </Sphere>
  )
}

function FloatingBox({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <MeshWobbleMaterial
        color="#8B5CF6"
        factor={1}
        speed={2}
      />
    </mesh>
  )
}

export function ThreeSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-background dark:bg-black/[0.96] relative overflow-hidden group border">
      {/* Interactive spotlight that follows mouse */}
      <Spotlight
        size={150}
        className="z-[5]"
        springOptions={{ bounce: 0 }}
      />
      
      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 relative z-20 p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Interactive 3D Scene</h3>
            <p className="text-muted-foreground text-lg">
              Experience smooth 3D animations and interactive elements.
              Click and drag to rotate, scroll to zoom.
            </p>
            <span className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
              <span>Move your mouse to see the spotlight effect</span>
            </span>
          </div>
        </div>

        {/* Right content - 3D Scene */}
        <div className="flex-1 relative z-20">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            
            {/* Animated spheres */}
            <AnimatedSphere position={[-2, 0, 0]} color="#3B82F6" />
            <AnimatedSphere position={[2, 0, 0]} color="#EF4444" />
            
            {/* Floating boxes */}
            <FloatingBox position={[0, 2, 0]} />
            <FloatingBox position={[0, -2, 0]} />
            
            <OrbitControls enableZoom={true} enablePan={false} />
          </Canvas>
        </div>
      </div>
    </Card>
  )
}
