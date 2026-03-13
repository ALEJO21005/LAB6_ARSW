import { useEffect, useRef } from 'react'

const PADDING = 30

export default function BlueprintCanvas({ id, points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!points || points.length === 0) return

    // Calculate bounds and scale to fill the canvas
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    const scaleX = (canvas.width - PADDING * 2) / rangeX
    const scaleY = (canvas.height - PADDING * 2) / rangeY
    const scale = Math.min(scaleX, scaleY)

    const toCanvasX = (x) => PADDING + (x - minX) * scale
    const toCanvasY = (y) => PADDING + (y - minY) * scale

    // Draw consecutive line segments
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(toCanvasX(points[0].x), toCanvasY(points[0].y))
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(toCanvasX(points[i].x), toCanvasY(points[i].y))
      }
      ctx.strokeStyle = '#0000ff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Mark each point
    ctx.fillStyle = '#ff0000'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(toCanvasX(p.x), toCanvasY(p.y), 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points, width, height])

  return (
    <canvas
      ref={ref}
      id={id}
      width={width}
      height={height}
      className="border border-gray-400 rounded-md"
    />
  )
}
