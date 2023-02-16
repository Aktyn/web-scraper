import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from './App'

describe(App.name, () => {
  //TODO

  // useEffect(() => {
  //   window.electronAPI.dummyEventFromMain((event, value) => {
  //     // eslint-disable-next-line no-console
  //     console.log('Event from electron:', event, value)
  //     setValueFromElectron(value)
  //     // event.sender.send('responseEvent', 1)
  //   })
  // }, [])
  //
  // const handleElectronCommunicationTest = async () => {
  //   const response = await window.electronAPI.dummyEvent()
  //   setResponseValue(response)
  //   // eslint-disable-next-line no-console
  //   console.log('Electron response:', response)
  // }

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
