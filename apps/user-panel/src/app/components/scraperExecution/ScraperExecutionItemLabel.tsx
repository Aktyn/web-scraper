import { Typography } from '@mui/material'
import { scraperExecutionScopeNames } from 'src/app/utils/dictionaries'
import type { ParsedScraperExecution } from './helpers'

interface ScraperExecutionItemProps {
  item: ParsedScraperExecution
}

export const ScraperExecutionItemLabel = ({ item }: ScraperExecutionItemProps) => {
  const status = item.finish ? 'finished' : 'running'

  return (
    <Typography variant="body1" fontWeight="bold" whiteSpace="nowrap">
      {scraperExecutionScopeNames[item.start.scope]} execution {status}
    </Typography>
  )
}
