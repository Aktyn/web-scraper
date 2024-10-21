import type { ReactNode } from 'react'
import { Chip, Stack, type ChipProps } from '@mui/material'
import { BooleanValue } from '../../table/BooleanValue'

interface ResultChipProps extends ChipProps {
  type: 'success' | 'failure'
}

export const ResultChip = ({ type, ...chipProps }: ResultChipProps) => {
  const typeProps = resultChipTypeProps[type]
  return <Chip label={typeProps.label} variant="outlined" color={typeProps.color} {...chipProps} />
}

const resultChipTypeProps: {
  [key in ResultChipProps['type']]: { label: ReactNode; color: ChipProps['color'] }
} = {
  success: {
    label: (
      <Stack direction="row" alignItems="center" gap="0.25rem">
        Success
        <BooleanValue value={true} iconProps={{ fontSize: 'inherit' }} sx={{ color: 'inherit' }} />
      </Stack>
    ),
    color: 'success',
  },
  failure: {
    label: (
      <Stack direction="row" alignItems="center" gap="0.25rem">
        Failure
        <BooleanValue value={false} iconProps={{ fontSize: 'inherit' }} sx={{ color: 'inherit' }} />
      </Stack>
    ),
    color: 'error',
  },
}
