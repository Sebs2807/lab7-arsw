export default function BlueprintList({ items = [], onSelect }) {
  if (!items.length) return <p>No hay blueprints para este autor.</p>
  return (
    <div className="grid">
      {items.map((bp) => (
        <div key={bp.name} className="card">
          <h3 style={{ marginTop: 0 }}>{bp.name}</h3>
          <p>
            <strong>Autor:</strong> {bp.author}
          </p>
          <p>
            <strong>Puntos:</strong> {bp.points ? bp.points.length : 0}
          </p>
          <button className="btn primary" onClick={() => onSelect(bp)}>
            Ver detalle
          </button>
        </div>
      ))}
    </div>
  )
}
