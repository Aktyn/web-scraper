import type { Key } from 'react'
import { Chip, Stack, Tooltip } from '@mui/material'

interface TagsCellProps {
  tags: { id?: Key; name: string; description?: string | null }[]
}

export const TagsCellValue = ({ tags }: TagsCellProps) => {
  if (!tags.length) {
    return null
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        maxWidth: '16rem',
        overflowX: 'auto',
        //TODO: button opening popup with list of all tags when their number exceeds certain amount
      }}
    >
      {tags.map((tag) => (
        <Tooltip key={tag.id ?? tag.name} title={tag.description}>
          <Chip
            label={tag.name}
            sx={{ fontWeight: 'bold', color: 'text.primary' }}
            variant="filled"
            size="small"
            color="default"
          />
        </Tooltip>
      ))}
    </Stack>
  )
}
