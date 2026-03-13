import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock completo del slice — incluye todos los thunks que importa BlueprintsPage
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
  createBlueprint: (payload) => ({ type: 'blueprints/createBlueprint', payload }),
  addPoint: (payload) => ({ type: 'blueprints/addPoint', payload }),
}))

function makeStore(preloaded = {}) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('despacha fetchByAuthor al hacer clic en Get Blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/author name/i), {
      target: { value: 'JohnConnor' },
    })
    fireEvent.click(screen.getByText(/get blueprints/i))

    expect(spy).toHaveBeenCalledWith({
      type: 'blueprints/fetchByAuthor',
      payload: 'JohnConnor',
    })
  })

  it('muestra los planos del autor en la tabla', () => {
    const store = makeStore({
      byAuthor: {
        Laura: [{ author: 'Laura', name: 'sala', points: [{ x: 1, y: 1 }] }],
      },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    // Simula haber buscado a Laura
    fireEvent.change(screen.getByPlaceholderText(/author name/i), {
      target: { value: 'Laura' },
    })
    fireEvent.click(screen.getByText(/get blueprints/i))

    expect(screen.getByText('sala')).toBeInTheDocument()
  })

  it('muestra el campo current blueprint vacío al inicio', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )
    const input = screen.getByPlaceholderText(/no blueprint selected/i)
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('')
  })

  it('muestra el nombre del plano actual en el campo de texto', () => {
    const store = makeStore({
      current: { author: 'Laura', name: 'living room', points: [] },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )
    const input = screen.getByDisplayValue('living room')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('readonly')
  })

  it('muestra el mensaje de error cuando status es failed', () => {
    const store = makeStore({ status: 'failed', error: 'Network Error' })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )
    expect(screen.getByText(/network error/i)).toBeInTheDocument()
  })
})
