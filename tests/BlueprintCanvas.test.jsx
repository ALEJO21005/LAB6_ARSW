import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import BlueprintCanvas from '../src/components/BlueprintCanvas.jsx'

describe('BlueprintCanvas', () => {
  it('renderiza un elemento canvas en el DOM', () => {
    const { container } = render(
      <BlueprintCanvas points={[{ x: 10, y: 10 }, { x: 50, y: 60 }]} />,
    )
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('llama a getContext al montar con puntos', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    render(<BlueprintCanvas points={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} />)
    expect(spy).toHaveBeenCalledWith('2d')
    spy.mockRestore()
  })

  it('renderiza el canvas aunque no se pasen puntos', () => {
    const { container } = render(<BlueprintCanvas points={[]} />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('renderiza el canvas cuando points es undefined', () => {
    const { container } = render(<BlueprintCanvas />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('aplica el width y height al elemento canvas', () => {
    const { container } = render(
      <BlueprintCanvas points={[]} width={400} height={300} />,
    )
    const canvas = container.querySelector('canvas')
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(300)
  })
})
