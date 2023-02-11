import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

describe(App.name, () => {
  beforeAll(() => {
    Object.assign(window, {
      electronAPI: {
        dummyEvent: () => Promise.resolve(1),
        dummyEventFromMain: vi.fn(),
      },
    })
  })

  it('renders learn react link', () => {
    render(<App />)
    const linkElement = screen.getByText(/Electron communication test/i)
    expect(linkElement).toBeInTheDocument()
  })
})
