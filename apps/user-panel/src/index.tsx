import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { Config } from './app/config'

const rootElement = document.getElementById(Config.rootElementId)

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
