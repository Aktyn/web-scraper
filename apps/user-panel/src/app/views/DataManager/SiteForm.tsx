import { useState } from 'react'
import { Stack, TextField } from '@mui/material'

export const SiteForm = () => {
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState<string | null>(null)

  return (
    <Stack p={2} spacing={2}>
      <TextField
        required
        value={url ?? ''}
        onChange={(event) => setUrl(event.target.value)}
        variant="standard"
        name="url"
        label="URL"
        autoFocus
      />
      <TextField
        value={language ?? ''}
        onChange={(event) => setLanguage(event.target.value)}
        variant="standard"
        name="language"
        label="Language"
      />
    </Stack>
  )
}
