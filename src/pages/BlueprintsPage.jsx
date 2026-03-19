import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
  addPoint,
  selectTop5ByPoints,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintForm from '../components/BlueprintForm.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status, error, createStatus, addPointStatus } = useSelector(
    (s) => s.blueprints,
  )
  const top5 = useSelector(selectTop5ByPoints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [pointX, setPointX] = useState('')
  const [pointY, setPointY] = useState('')
  const items = byAuthor[selectedAuthor] || []

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const handleCreate = async (payload) => {
    await dispatch(createBlueprint(payload))
    setAuthorInput(payload.author)
    setSelectedAuthor(payload.author)
  }

  const handleAddPoint = (e) => {
    e.preventDefault()
    if (!current) return
    const x = Number(pointX)
    const y = Number(pointY)
    dispatch(addPoint({ author: current.author, name: current.name, point: { x, y } }))
    setPointX('')
    setPointY('')
  }

  const handleCanvasPoint = ({ x, y }) => {
    if (!current) return
    dispatch(addPoint({ author: current.author, name: current.name, point: { x, y } }))
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                id="author"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && getBlueprints()}
                placeholder="Enter author name"
              />
              <button
                className="btn primary"
                onClick={getBlueprints}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Cargando…' : 'Get Blueprints'}
              </button>
            </div>
          </div>
          {status === 'loading' && <p>Cargando blueprints…</p>}
          {status === 'failed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ color: '#f87171', margin: 0 }}>Error: {error}</p>
              <button
                className="btn"
                onClick={() => selectedAuthor && dispatch(fetchByAuthor(selectedAuthor))}
              >
                Reintentar
              </button>
            </div>
          )}
          {selectedAuthor && (
            <p>
              Blueprints by <strong>{selectedAuthor}</strong>
            </p>
          )}
          <div className="card" style={{ overflowY: 'auto', maxHeight: 300 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((bp) => (
                  <tr key={bp.name}>
                    <td>{bp.name}</td>
                    <td>{bp.points?.length || 0}</td>
                    <td>
                      <button className="btn" onClick={() => openBlueprint(bp)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">Total points: {totalPoints}</div>
        </div>

        {top5.length > 0 && (
          <div className="card">
            <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}>Top 5 blueprints (por puntos)</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Autor</th>
                  <th>Nombre</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((bp, i) => (
                  <tr key={`${bp.author}-${bp.name}`}>
                    <td>{i + 1}</td>
                    <td>{bp.author}</td>
                    <td>{bp.name}</td>
                    <td>{bp.points?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <BlueprintForm
          onSubmit={handleCreate}
          loading={createStatus === 'loading'}
        />
      </section>

      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="current-blueprint">Current blueprint</label>
            <input
              id="current-blueprint"
              className="input"
              readOnly
              value={current?.name || ''}
              placeholder="No blueprint selected"
            />
          </div>
          {current && (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 8px' }}>
              Haz clic en el canvas para agregar un punto
            </p>
          )}
          <BlueprintCanvas
            id="blueprint-canvas-1"
            author={current?.author}
            name={current?.name}
            points={current?.points}
            onPointClick={(point) => dispatch(addPoint({ author: current.author, name: current.name, point }))}
          />
        </div>

        {current && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Agregar punto</h3>
            <form onSubmit={handleAddPoint}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div>
                  <label>X</label>
                  <input
                    type="number"
                    className="input"
                    value={pointX}
                    onChange={(e) => setPointX(e.target.value)}
                    placeholder="0"
                    required
                    style={{ width: 80 }}
                  />
                </div>
                <div>
                  <label>Y</label>
                  <input
                    type="number"
                    className="input"
                    value={pointY}
                    onChange={(e) => setPointY(e.target.value)}
                    placeholder="0"
                    required
                    style={{ width: 80 }}
                  />
                </div>
                <button
                  className="btn primary"
                  type="submit"
                  disabled={addPointStatus === 'loading'}
                >
                  {addPointStatus === 'loading' ? 'Guardando…' : 'Add Point'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
