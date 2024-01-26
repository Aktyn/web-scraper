import { Chip, type ChipProps, Stack } from '@mui/material'
import { type TermKey, termsDetails } from '../../../utils/terms'
import { TermInfo } from '../TermInfo'

export const TermChip = ({ term, ...chipProps }: { term: TermKey } & ChipProps) => (
  <Chip
    label={<TermChipLabel term={term} />}
    variant="outlined"
    size="small"
    color="primary"
    {...chipProps}
  />
)

export const TermChipLabel = ({ term }: { term: TermKey }) => {
  const termInfo = termsDetails.find((termDetails) => termDetails.key === term)

  return (
    <Stack direction="row" alignItems="center" gap="0.25rem" whiteSpace="nowrap">
      {termInfo?.title}
      <TermInfo term={term} sx={{ pointerEvents: 'all' }} />
    </Stack>
  )
}
