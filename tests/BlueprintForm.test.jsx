import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BlueprintForm from '../src/components/BlueprintForm.jsx'

const DEFAULT_JSON = '[{"x":10,"y":10},{"x":40,"y":60}]'

describe('BlueprintForm', () => {
  it('llama onSubmit con los datos parseados al enviar', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('juan.perez'), {
      target: { value: 'john' },
    })
    fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), {
      target: { value: 'house' },
    })
    fireEvent.change(screen.getByDisplayValue(DEFAULT_JSON), {
      target: { value: '[{"x":1,"y":2}]' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 2 }],
    })
  })

  it('muestra error en el DOM si el JSON de puntos es inválido', () => {
    const onSubmit = vi.fn()
    render(<BlueprintForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('juan.perez'), {
      target: { value: 'ana' },
    })
    fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), {
      target: { value: 'test' },
    })
    fireEvent.change(screen.getByDisplayValue(DEFAULT_JSON), {
      target: { value: 'esto no es json' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }))

    expect(screen.getByText(/json de puntos inválido/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('los campos autor y nombre tienen el atributo required', () => {
    render(<BlueprintForm onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('juan.perez')).toBeRequired()
    expect(screen.getByPlaceholderText('mi-dibujo')).toBeRequired()
  })

  it('limpia el formulario tras un envío exitoso', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BlueprintForm onSubmit={onSubmit} />)

    const autorInput = screen.getByPlaceholderText('juan.perez')
    fireEvent.change(autorInput, { target: { value: 'maria' } })
    fireEvent.change(screen.getByPlaceholderText('mi-dibujo'), {
      target: { value: 'plano1' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }))

    // handle es async — esperar a que React aplique el reset de estado
    await waitFor(() => expect(autorInput.value).toBe(''))
  })
})
