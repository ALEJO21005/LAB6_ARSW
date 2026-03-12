import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchByAuthor,
  fetchBlueprint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
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
              <button className="btn primary" onClick={getBlueprints}>
                Get Blueprints
              </button>
            </div>
          </div>
          {status === 'loading' && <p>Loading...</p>}
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
      </section>
      <section>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            Current blueprint: {current?.name || 'none'}
          </h3>
          <BlueprintCanvas id="blueprint-canvas-1" points={current?.points} />
        </div>
      </section>
    </div>
  )
}
