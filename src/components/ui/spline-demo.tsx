'use client'

import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { StarBorder } from "@/components/ui/star-border"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

export function SplineSceneBasic() {
  const navigate = useNavigate()
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadSpline) {
            setShouldLoadSpline(true)
            // Once loaded, we can disconnect the observer
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: '50px' // Start loading 50px before the component comes into view
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [shouldLoadSpline])

  return (
    <Card ref={containerRef} className="w-full h-[500px] bg-background dark:bg-black/[0.96] relative overflow-hidden group border">
      {/* Interactive spotlight that follows mouse */}
      <Spotlight
        size={150}
        className="z-[5]"
        springOptions={{ bounce: 0 }}
      />

      <div className="flex h-full relative z-10">
        {/* Left content */}
        <div className="flex-1 p-8 pl-24 relative z-20 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
            AI Interview Coach
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg">
            Transform your interview skills with our intelligent AI coach. Practice with realistic scenarios,
            receive instant feedback, and build the confidence you need to succeed.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Experience the future of interview preparation</span>
            </span>
          </div>

          <div className="mt-8">
            <StarBorder
              as="button"
              onClick={() => navigate('/ai-interviewer')}
              className="hover:scale-105 transition-transform duration-200"
              color="hsl(var(--primary))"
              speed="4s"
            >
              Start AI Interview Practice
            </StarBorder>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative z-20">
          {shouldLoadSpline ? (
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">Loading 3D Experience...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
