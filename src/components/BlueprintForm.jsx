import { useState } from 'react'

export default function BlueprintForm({ onSubmit, loading = false }) {
  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [pointsJSON, setPointsJSON] = useState('[{"x":10,"y":10},{"x":40,"y":60}]')
  const [formError, setFormError] = useState(null)

  const handle = async (e) => {
    e.preventDefault()
    setFormError(null)
    let points
    try {
      points = JSON.parse(pointsJSON)
    } catch {
      setFormError('JSON de puntos inválido')
      return
    }
    await onSubmit({ author, name, points })
    setAuthor('')
    setName('')
    setPointsJSON('[{"x":10,"y":10},{"x":40,"y":60}]')
  }

  return (
    <form onSubmit={handle} className="card">
      <h3 style={{ marginTop: 0 }}>Crear Blueprint</h3>
      <div className="grid cols-2">
        <div>
          <label>Autor</label>
          <input
            className="input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="juan.perez"
            required
          />
        </div>
        <div>
          <label>Nombre</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mi-dibujo"
            required
          />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Puntos (JSON)</label>
        <textarea
          className="input"
          rows="5"
          value={pointsJSON}
          onChange={(e) => setPointsJSON(e.target.value)}
        />
      </div>
      {formError && <p style={{ color: '#f87171', marginTop: 8 }}>{formError}</p>}
      <div style={{ marginTop: 12 }}>
        <button className="btn primary" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
