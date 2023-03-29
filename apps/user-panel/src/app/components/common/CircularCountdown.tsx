import type { ReactNode } from 'react'
import { Box, CircularProgress, circularProgressClasses, Typography } from '@mui/material'

interface CircularCountdownProps {
  /** Value between 0 and 1 */
  progress: number
  label: ReactNode
}

export const CircularCountdown = ({ progress, label }: CircularCountdownProps) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        size={20}
        value={progress * 100}
        sx={{
          [`& .${circularProgressClasses.circle}`]: {
            transition: (theme) =>
              theme.transitions.create('stroke-dashoffset', { duration: 1000 }),
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="span" textAlign="center" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  )
}
