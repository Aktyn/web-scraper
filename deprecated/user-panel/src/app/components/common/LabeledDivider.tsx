import { forwardRef, type ReactNode } from 'react'
import { Box, type BoxProps, Divider, Typography } from '@mui/material'

type LabeledDividerProps = {
  label: ReactNode
} & BoxProps

export const LabeledDivider = forwardRef<HTMLDivElement, LabeledDividerProps>(
  ({ label, ...boxProps }, forwardRef) => (
    <Box
      ref={forwardRef}
      {...boxProps}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        columnGap: '1rem',
        '& > hr': {
          minWidth: '2rem',
        },
        ...boxProps.sx,
      }}
    >
      <Divider />
      {typeof label === 'string' ? (
        <Typography variant="h6" fontWeight="bold" color="text.secondary">
          {label}
        </Typography>
      ) : (
        label
      )}
      <Divider />
    </Box>
  ),
)
