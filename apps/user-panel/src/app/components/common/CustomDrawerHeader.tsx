import type { ReactNode } from 'react'
import { CloseRounded } from '@mui/icons-material'
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material'

interface CustomDrawerHeaderProps {
  title?: ReactNode
  onClose?: () => void
}

export const CustomDrawerHeader = ({ title, onClose }: CustomDrawerHeaderProps) => {
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ p: 2 }}
      >
        {title ? (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {title}
          </Typography>
        ) : (
          <Box />
        )}
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseRounded />
          </IconButton>
        )}
      </Stack>
      <Divider />
    </>
  )
}
