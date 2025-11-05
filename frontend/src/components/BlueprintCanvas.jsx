import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360, onAddPoint }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const zoom = 10
    const offsetX = 20 // margen fijo
    const offsetY = 20 // margen fijo

    // Guardamos funciones inversas para calcular coordenadas blueprint
    canvas.toBlueprintX = (x) => (x - offsetX) / zoom
    canvas.toBlueprintY = (y) => (y - offsetY) / zoom

    // Fondo
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Cuadrícula
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

    // Si no hay puntos, parar aquí
    if (points.length === 0) return

    // Dibujar líneas
    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(points[0].x * zoom + offsetX, points[0].y * zoom + offsetY)
    for (let i = 1; i < points.length; i++) {
      const p = points[i]
      ctx.lineTo(p.x * zoom + offsetX, p.y * zoom + offsetY)
    }
    ctx.stroke()

    // Dibujar puntos
    ctx.fillStyle = '#fbbf24'
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x * zoom + offsetX, p.y * zoom + offsetY, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  const handleClick = (e) => {
    console.log(points)
    const canvas = ref.current
    const rect = canvas.getBoundingClientRect()

    // Ajuste de escala entre tamaño visual y tamaño lógico
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Coordenadas ajustadas
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Convertimos a coordenadas de blueprint y redondeamos a enteros
    const bpX = Math.round(canvas.toBlueprintX(x))
    const bpY = Math.round(canvas.toBlueprintY(y))

    console.log(
      `Canvas clicked at (${x.toFixed(2)}, ${y.toFixed(2)}) -> Blueprint (${bpX.toFixed(2)}, ${bpY.toFixed(2)})`,
    )

    if (onAddPoint) onAddPoint({ x: bpX, y: bpY })
  }


  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      onClick={handleClick}
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
