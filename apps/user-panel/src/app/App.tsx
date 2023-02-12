import React, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [responseValue, setResponseValue] = useState(0)
  const [valueFromElectron, setValueFromElectron] = useState(0)

  useEffect(() => {
    window.electronAPI.dummyEventFromMain((event, value) => {
      // eslint-disable-next-line no-console
      console.log('Event from electron:', event, value)
      setValueFromElectron(value)
      // event.sender.send('responseEvent', 1)
    })
  }, [])

  const handleElectronCommunicationTest = async () => {
    const response = await window.electronAPI.dummyEvent()
    setResponseValue(response)
    // eslint-disable-next-line no-console
    console.log('Electron response:', response)
  }

  return (
    <div className="App">
      <button onClick={handleElectronCommunicationTest}>Electron communication test</button>
      <span>Response from electron: {responseValue}</span>
      <span>Value from electron: {valueFromElectron}</span>
    </div>
  )
}

export default App
