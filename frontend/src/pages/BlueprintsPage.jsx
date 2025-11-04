import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connect, disconnect } from '../services/wsClient.js'

import {
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
  blueprintAddedOrUpdated,
  addPoint,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] ?? []

  useEffect(() => {
    if (!window.stompConnected) {
      window.stompConnected = true

      connect((message) => {
        console.log('WebSocket message received in BlueprintsPage:', message)
        dispatch(blueprintAddedOrUpdated(message))
      })
    }

    return () => {
      disconnect()
      window.stompConnected = false
    }
  }, [dispatch])


  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const totalPoints = useMemo(() => {
    if (!Array.isArray(items)) return 0
    return items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0)
  }, [items])

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const handleAddPoint = (p) => {
    if (!current) return
    const payload = { author: current.author, name: current.name, point: p }
    dispatch(addPoint(payload))
  }


  const addBlueprint = async () => {
    let author = selectedAuthor || authorInput
    if (!author) {
      author = window.prompt('Author for new blueprint:')
    }
    if (!author) return

    const name = window.prompt('Name for new blueprint:')
    if (!name) return

    const payload = { author, name, points: [] }
    try {
      await dispatch(createBlueprint(payload)).unwrap()
      setSelectedAuthor(author)
      dispatch(fetchBlueprint({ author, name }))
    } catch (e) {
      console.error('Failed to create blueprint', e)
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr', gap: 24 }}>
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <h2 style={{ marginTop: 0 }}>
            {import.meta.env.VITE_USE_MOCK === 'true' ? 'Usando Mock API' : 'Usando Real API'}
          </h2>

          <div style={{ display: 'flex', gap: 12 }}>
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ marginTop: 0}}>
              {selectedAuthor ? (
                <span style={{ whiteSpace: 'nowrap' }}>
                  {selectedAuthor + "\u2019s\u00A0Blueprints:"}
                </span>
              ) : (
                'Results'
              )}
            </h3>
            <button className="btn primary" onClick={addBlueprint} style={{width: '20%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              Añadir
            </button>
          </div>
          {status === 'loading' && <p>Cargando...</p>}
          {!items.length && status !== 'loading' && <p>Sin resultados.</p>}
          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Blueprint name
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Number of points
                    </th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={`${bp.author}-${bp.name}`}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        {bp.name}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          borderBottom: '1px solid #1f2937',
                        }}
                      >
                        {bp.points?.length || 0}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        <button className="btn" onClick={() => openBlueprint(bp)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>
      </section>

      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ marginTop: 0 }}>Current blueprint: {current?.name || '—'}</h3>
        </div>
        <BlueprintCanvas points={current?.points || []} onAddPoint={handleAddPoint} />
      </section>
    </div>
  )
}
