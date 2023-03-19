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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        {title ? (
          <Typography variant="h6" color="text.secondary">
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
