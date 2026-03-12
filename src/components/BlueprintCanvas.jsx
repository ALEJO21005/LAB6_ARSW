import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ id, points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Optional: Draw a background or grid
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.strokeStyle = '#0000ff' // Blue lines
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw points
    ctx.fillStyle = '#ff0000' // Red points
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
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
