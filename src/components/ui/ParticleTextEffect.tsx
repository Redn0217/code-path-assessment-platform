
"use client"

import { useEffect, useRef, useState } from "react"

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.0
  maxForce = 0.1
  particleSize = 10
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.01

  move() {
    // Check if particle is close enough to its target to slow down
    let proximityMult = 1
    const distance = Math.sqrt(Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2))

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    // Add force towards target
    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y)
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    // Move particle
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    // Blend towards target color
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    // Calculate current color
    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      // Set target outside the scene
      const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2)
      this.target.x = randomPos.x
      this.target.y = randomPos.y

      // Begin blending color to black
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0

      this.isKilled = true
    }
  }

  private generateRandomPos(x: number, y: number, mag: number): Vector2D {
    // Use dynamic canvas dimensions instead of fixed values
    const canvas = document.querySelector('canvas')
    const canvasWidth = canvas?.width || 2000
    const canvasHeight = canvas?.height || 1000

    const randomX = Math.random() * canvasWidth
    const randomY = Math.random() * canvasHeight

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }
}

interface ParticleTextEffectProps {
  words?: string[]
}

const DEFAULT_WORDS = ["evalu8", "AI-Powered", "Learning", "Assessment", "Innovation"]

export function ParticleTextEffect({ words = DEFAULT_WORDS }: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false })

  const pixelSteps = 6
  const drawAsPoints = true

  const generateRandomPos = (x: number, y: number, mag: number): Vector2D => {
    // Use current canvas dimensions
    const canvas = canvasRef.current
    const canvasWidth = canvas?.width || 2000
    const canvasHeight = canvas?.height || 1000

    const randomX = Math.random() * canvasWidth
    const randomY = Math.random() * canvasHeight

    const direction = {
      x: randomX - x,
      y: randomY - y,
    }

    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }

    return {
      x: x + direction.x,
      y: y + direction.y,
    }
  }

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    // Create off-screen canvas for text rendering
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")!

    // Draw text - make font size responsive to canvas width
    offscreenCtx.fillStyle = "black"
    const fontSize = Math.max(canvas.width * 0.1, 60) // 10% of canvas width, minimum 60px
    offscreenCtx.font = `bold ${fontSize}px Arial`
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    // Generate bright, vibrant colors
    const brightColors = [
      { r: 34, g: 197, b: 94 },   // Bright Green
      { r: 249, g: 115, b: 22 },  // Bright Orange
      { r: 59, g: 130, b: 246 },  // Bright Blue
      { r: 168, g: 85, b: 247 },  // Bright Purple
      { r: 236, g: 72, b: 153 },  // Bright Pink
      { r: 245, g: 158, b: 11 },  // Bright Amber
      { r: 20, g: 184, b: 166 },  // Bright Teal
      { r: 239, g: 68, b: 68 },   // Bright Red
      { r: 132, g: 204, b: 22 },  // Bright Lime
      { r: 147, g: 51, b: 234 },  // Bright Violet
    ]

    const newColor = brightColors[Math.floor(Math.random() * brightColors.length)]

    const particles = particlesRef.current
    let particleIndex = 0

    // Collect coordinates
    const coordsIndexes: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    // Shuffle coordinates for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle: Particle

        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle()

          const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2)
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y

          particle.maxSpeed = Math.random() * 6 + 4
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025

          particles.push(particle)
        }

        // Set color transition
        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0

        particle.target.x = x
        particle.target.y = y
      }
    }

    // Kill remaining particles
    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const particles = particlesRef.current

    // Background with motion blur - adapt to theme
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? "rgba(34, 34, 40, 0.1)" : "rgba(255, 255, 255, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.move()
      particle.draw(ctx, drawAsPoints)

      // Remove dead particles that are out of bounds
      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // Handle mouse interaction - destroy particles on hover
    if (mouseRef.current.isHovering) {
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.pos.x - mouseRef.current.x, 2) + Math.pow(particle.pos.y - mouseRef.current.y, 2),
        )
        if (distance < 80) { // Increased radius for easier interaction
          particle.kill(canvas.width, canvas.height)
        }
      })
    }

    // Auto-advance words
    frameCountRef.current++
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Make canvas responsive to screen size with consistent margins
    const updateCanvasSize = () => {
      const viewportWidth = window.innerWidth

      let canvasWidth: number, canvasHeight: number

      // Responsive sizing based on viewport
      if (viewportWidth < 640) { // Mobile
        canvasWidth = Math.min(viewportWidth * 0.9, 600)
        canvasHeight = canvasWidth * 0.6
      } else if (viewportWidth < 1024) { // Tablet/Laptop
        canvasWidth = Math.min(viewportWidth * 0.85, 1000)
        canvasHeight = canvasWidth * 0.55
      } else if (viewportWidth < 1440) { // Desktop
        canvasWidth = Math.min(viewportWidth * 0.8, 1400)
        canvasHeight = canvasWidth * 0.5
      } else { // Large screens
        canvasWidth = Math.min(viewportWidth * 0.75, 1800)
        canvasHeight = canvasWidth * 0.5
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Initialize with first word
    nextWord(words[0], canvas)

    // Start animation
    animate()

    // Mouse event handlers for hover-based destruction
    const handleMouseEnter = () => {
      mouseRef.current.isHovering = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.isHovering = true
    }

    canvas.addEventListener("mouseenter", handleMouseEnter)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', updateCanvasSize)
      canvas.removeEventListener("mouseenter", handleMouseEnter)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [words])

  return (
    <div className="w-full bg-background">
      <div className="flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          className="border border-border rounded-lg shadow-lg bg-background"
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>
    </div>
  )
}
