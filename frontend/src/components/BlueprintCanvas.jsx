import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360, onAddPoint }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const zoom = 10
    const offsetX = 20
    const offsetY = 20

    canvas.toBlueprintX = (x) => (x - offsetX) / zoom
    canvas.toBlueprintY = (y) => (y - offsetY) / zoom

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += zoom) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += zoom) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    if (points.length === 0) return

    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(points[0].x * zoom + offsetX, points[0].y * zoom + offsetY)
    for (let i = 1; i < points.length; i++) {
      const p = points[i]
      ctx.lineTo(p.x * zoom + offsetX, p.y * zoom + offsetY)
    }
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x * zoom + offsetX, p.y * zoom + offsetY, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    if (points.length > 0) {
      const last = points[points.length - 1]
      ctx.beginPath()
      ctx.fillStyle = '#FF0000'
      ctx.arc(last.x * zoom + offsetX, last.y * zoom + offsetY, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.stroke()
    }
  }, [points])

  const handleClick = (e) => {
    console.log(points)
    const canvas = ref.current
    const rect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let xPx, yPx
    if (e && e.nativeEvent && typeof e.nativeEvent.offsetX === 'number' && typeof e.nativeEvent.offsetY === 'number') {
      xPx = e.nativeEvent.offsetX * scaleX
      yPx = e.nativeEvent.offsetY * scaleY
    } else {
      xPx = (e.clientX - rect.left) * scaleX
      yPx = (e.clientY - rect.top) * scaleY
    }

    const bpX = Math.round(canvas.toBlueprintX(xPx))
    const bpY = Math.round(canvas.toBlueprintY(yPx))

    console.log(
      `Canvas clicked at (${xPx.toFixed(2)}, ${yPx.toFixed(2)}) -> Blueprint (${bpX.toFixed(2)}, ${bpY.toFixed(2)})`,
    )

    if (onAddPoint) onAddPoint({ x: bpX, y: bpY })
  }


  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
        onClick={handleClick}
        onPointerDown={handleClick}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
        cursor: 'crosshair',
      }}
    />
  )
}
