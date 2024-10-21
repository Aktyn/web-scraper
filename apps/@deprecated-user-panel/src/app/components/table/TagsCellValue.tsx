import type { Key } from 'react'
import { Chip, Tooltip } from '@mui/material'
import { HorizontallyScrollableContainer } from '../common/HorizontallyScrollableContainer'

interface TagsCellProps {
  tags: { id?: Key; name: string; description?: string | null }[]
}

export const TagsCellValue = ({ tags }: TagsCellProps) => {
  if (!tags.length) {
    return null
  }

  return (
    <HorizontallyScrollableContainer
      direction="row"
      alignItems="center"
      gap={1}
      maxWidth="16rem"
      sx={{ overflowX: 'auto' }}
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
    </HorizontallyScrollableContainer>
  )
}
