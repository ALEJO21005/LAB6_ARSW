import { describe, it, expect } from 'vitest'
import reducer, {
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
  addPoint,
} from '../src/features/blueprints/blueprintsSlice.js'

const INITIAL = {
  authors: [],
  byAuthor: {},
  current: null,
  status: 'idle',
  error: null,
}

describe('blueprints slice — estado inicial', () => {
  it('inicializa correctamente', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
  })
})

describe('blueprints slice — fetchByAuthor', () => {
  it('pone status en loading cuando está pendiente', () => {
    const state = reducer(INITIAL, fetchByAuthor.pending('id', 'Laura'))
    expect(state.status).toBe('loading')
  })

  it('almacena los planos por autor al completarse', () => {
    const items = [{ author: 'Laura', name: 'sala', points: [] }]
    const action = fetchByAuthor.fulfilled({ author: 'Laura', items }, 'id', 'Laura')
    const state = reducer(INITIAL, action)
    expect(state.status).toBe('succeeded')
    expect(state.byAuthor['Laura']).toEqual(items)
  })

  it('guarda el mensaje de error al fallar', () => {
    const error = new Error('Network Error')
    const action = fetchByAuthor.rejected(error, 'id', 'Laura')
    const state = reducer(INITIAL, action)
    expect(state.status).toBe('failed')
    expect(state.error).toBe('Network Error')
  })
})

describe('blueprints slice — fetchBlueprint', () => {
  it('asigna current al completarse', () => {
    const bp = { author: 'Laura', name: 'sala', points: [{ x: 1, y: 2 }] }
    const action = fetchBlueprint.fulfilled(bp, 'id', { author: 'Laura', name: 'sala' })
    const state = reducer(INITIAL, action)
    expect(state.current).toEqual(bp)
  })
})

describe('blueprints slice — createBlueprint', () => {
  it('inicializa byAuthor[author] y agrega el plano si no existía', () => {
    const bp = { author: 'Mario', name: 'cuarto', points: [] }
    const action = createBlueprint.fulfilled(bp, 'id', bp)
    const state = reducer(INITIAL, action)
    expect(state.byAuthor['Mario']).toHaveLength(1)
    expect(state.byAuthor['Mario'][0]).toEqual(bp)
  })

  it('actualiza un plano existente si ya tiene ese nombre', () => {
    const old = { author: 'Mario', name: 'cuarto', points: [] }
    const updated = { author: 'Mario', name: 'cuarto', points: [{ x: 5, y: 5 }] }
    const prev = { ...INITIAL, byAuthor: { Mario: [old] } }
    const action = createBlueprint.fulfilled(updated, 'id', updated)
    const state = reducer(prev, action)
    expect(state.byAuthor['Mario']).toHaveLength(1)
    expect(state.byAuthor['Mario'][0].points).toHaveLength(1)
  })
})

describe('blueprints slice — addPoint', () => {
  it('actualiza current con los nuevos puntos', () => {
    const bp = { author: 'Laura', name: 'sala', points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] }
    const prev = { ...INITIAL, current: { author: 'Laura', name: 'sala', points: [{ x: 1, y: 1 }] } }
    const action = addPoint.fulfilled(bp, 'id', { author: 'Laura', name: 'sala', point: { x: 2, y: 2 } })
    const state = reducer(prev, action)
    expect(state.current).toEqual(bp)
    expect(state.current.points).toHaveLength(2)
  })

  it('actualiza byAuthor si el autor ya estaba cargado', () => {
    const old = { author: 'Laura', name: 'sala', points: [{ x: 1, y: 1 }] }
    const updated = { author: 'Laura', name: 'sala', points: [{ x: 1, y: 1 }, { x: 9, y: 9 }] }
    const prev = { ...INITIAL, byAuthor: { Laura: [old] }, current: old }
    const action = addPoint.fulfilled(updated, 'id', { author: 'Laura', name: 'sala', point: { x: 9, y: 9 } })
    const state = reducer(prev, action)
    expect(state.byAuthor['Laura'][0].points).toHaveLength(2)
  })
})
