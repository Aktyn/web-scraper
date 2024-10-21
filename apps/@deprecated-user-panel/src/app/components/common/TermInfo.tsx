import { memo } from 'react'
import { InfoRounded } from '@mui/icons-material'
import { type SvgIconTypeMap, Tooltip } from '@mui/material'
import { type TermKey, termsDetails } from '../../utils/terms'

interface TermInfoProps {
  term: TermKey
}

export const TermInfo = memo<TermInfoProps & SvgIconTypeMap['props']>(({ term, ...iconProps }) => {
  const termContent = termsDetails.find((termDetails) => termDetails.key === term)?.content

  return (
    <Tooltip title={termContent ?? ''}>
      <InfoRounded fontSize="inherit" {...iconProps} />
    </Tooltip>
  )
})
