'use client'

import { Suspense, useEffect, useState } from 'react'

interface SplineSceneProps {
  scene: string
  className?: string
}

// Dynamic import wrapper
async function loadSpline() {
  try {
    const module = await import('@splinetool/react-spline')
    return module.default
  } catch (error) {
    console.error('Failed to load Spline:', error)
    return null
  }
}

// Wrapper component to handle dynamic loading
function SplineWrapper({ scene, className }: { scene: string; className?: string }) {
  const [SplineComponent, setSplineComponent] = useState<any>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let mounted = true

    loadSpline().then(component => {
      if (mounted) {
        if (component) {
          setSplineComponent(() => component)
        } else {
          setHasError(true)
        }
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  if (hasError || !SplineComponent) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted/20 rounded-lg ${className || ''}`}>
        <div className="text-center">
          <p className="text-muted-foreground">3D Scene unavailable</p>
        </div>
      </div>
    )
  }

  try {
    return <SplineComponent scene={scene} className={className} />
  } catch (error) {
    console.error('Spline render error:', error)
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted/20 rounded-lg ${className || ''}`}>
        <div className="text-center">
          <p className="text-muted-foreground">3D Scene unavailable</p>
        </div>
      </div>
    )
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on server
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SplineWrapper scene={scene} className={className} />
    </Suspense>
  )
}


