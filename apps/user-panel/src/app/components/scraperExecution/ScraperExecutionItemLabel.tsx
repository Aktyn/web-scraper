import { Typography, type TypographyProps } from '@mui/material'
import { scraperExecutionScopeNames } from 'src/app/utils/dictionaries'
import type { ParsedScraperExecution } from './helpers'

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
