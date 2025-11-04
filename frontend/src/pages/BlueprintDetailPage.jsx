import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const dispatch = useDispatch()
  const bp = useSelector((s) => s.blueprints.current)

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  if (!bp)
    return (
      <div className="card">
        <p>Cargando...</p>
      </div>
    )

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{bp.name}</h2>
      <p>
        <strong>Autor:</strong> {bp.author}
      </p>
      <p>
        <strong>Puntos:</strong> {bp.points?.length || 0}
      </p>
      <svg width="400" height="200" style={{ background: '#0b1220', borderRadius: 12 }}>
        {bp.points?.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" />
        ))}
      </svg>
    </div>
  )
}
