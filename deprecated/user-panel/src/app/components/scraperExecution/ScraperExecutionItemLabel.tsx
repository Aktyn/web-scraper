import { Typography, type TypographyProps } from '@mui/material'
import type { ParsedScraperExecution } from './helpers'
import { scraperExecutionScopeNames } from '../../utils/dictionaries'

type ScraperExecutionItemProps = {
  item: ParsedScraperExecution
} & TypographyProps

export const ScraperExecutionItemLabel = ({
  item,
  ...typographyProps
}: ScraperExecutionItemProps) => {
  const status = item.finish ? 'finished' : 'running'

  return (
    <Typography variant="body1" fontWeight="bold" whiteSpace="nowrap" {...typographyProps}>
      {scraperExecutionScopeNames[item.start.scope]} execution {status}
    </Typography>
  )
}
