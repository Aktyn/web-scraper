import { render, screen } from '@testing-library/react'
import App from './App'

describe(App.name, () => {
  it('renders learn react link', () => {
    render(<App />)
    const linkElement = screen.getByText(/Electron communication test/i)
    expect(linkElement).toBeInTheDocument()
  })
})
