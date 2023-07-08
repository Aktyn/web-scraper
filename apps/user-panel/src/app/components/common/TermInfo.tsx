import { memo } from 'react'
import { InfoRounded } from '@mui/icons-material'
import { type SvgIconTypeMap, Tooltip } from '@mui/material'
import { termsDetails } from 'src/app/utils/terms'

interface TermInfoProps {
  term: (typeof termsDetails)[number]['title']
}

export const TermInfo = memo<TermInfoProps & SvgIconTypeMap['props']>(({ term, ...iconProps }) => {
  const termContent = termsDetails.find((termDetails) => termDetails.title === term)?.content

  return (
    <Tooltip title={termContent ?? ''}>
      <InfoRounded fontSize="inherit" {...iconProps} />
    </Tooltip>
  )
})
