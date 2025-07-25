'use client'

import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-background dark:bg-black/[0.96] relative overflow-hidden group border">
      {/* Interactive spotlight that follows mouse */}
      <Spotlight
        size={150}
        className="z-[5]"
        springOptions={{ bounce: 0 }}
      />

      <div className="flex h-full relative z-10">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-20 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
            Interactive 3D
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
              <span>Move your mouse to see the spotlight effect</span>
            </span>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative z-20">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
