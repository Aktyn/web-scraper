import express from 'express'

export function initServer(app = express()) {
  for (const page of pages) {
    app.get(page.route, (_req, res) => {
      res.status(200).type('text/html').send(page.body)
    })
  }

  const port = 1357
  try {
    return app.listen(port)
  } catch {
    return null
  }
}

const pages = [
  {
    route: '/mock-preview',
    body: `
      <html>
        <body>
          <p>Mock preview</p>
        </body>
      </html>
    `,
  },
  {
    route: '/mock-testing',
    body: `
      <html>
        <body>
          <h1>Mock testing</h1>
          <input type="text" />
          <select>
            <option value='select option'>Select option</option>
            <option value="mock option">Mock option</option>
            <option value="mock option 2">Mock option 2</option>
          </select>
          <button>Mock action</button>
          <div id="error-message">mock error message</div>
          <div id="success-message">mock success message</div>
        </body>
      </html>
    `,
  },
]
