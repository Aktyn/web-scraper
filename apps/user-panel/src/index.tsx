import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  //TODO: consider removing it for good
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
)
