import { useMemo } from 'react'
import { Stack, Typography } from '@mui/material'
import { ScraperMode } from '@web-scraper/common'
import { HorizontallyScrollableContainer } from '../../components/common/HorizontallyScrollableContainer'
import { ExecutionTree } from '../../components/scraperExecution/ExecutionTree'
import {
  parseScraperExecution,
  parseScraperExecutionAsTree,
} from '../../components/scraperExecution/helpers'
import {
  ScraperExecutionModule,
  type ScraperExecutionLite,
} from '../../modules/ScraperExecutionModule'

export const ExecutionsMonitoring = () => {
  const { scraperExecutions } = ScraperExecutionModule.useScraperExecutionContext()

  return scraperExecutions.length > 0 ? (
    <Stack flexGrow={1} maxWidth="100%" alignItems="flex-start" pt="1rem" mt="-1rem">
      {scraperExecutions.map(
        (execution) =>
          execution.mode !== ScraperMode.PREVIEW && (
            <ScraperExecutionItem key={execution.scraperId} execution={execution} />
          ),
      )}
    </Stack>
  ) : (
    <Typography variant="h6" color="text.secondary" fontWeight="bold" textAlign="center">
      No executions are currently running
    </Typography>
  )
}

interface ScraperExecutionItemProps {
  execution: ScraperExecutionLite
}

const ScraperExecutionItem = ({ execution }: ScraperExecutionItemProps) => {
  const executionData = ScraperExecutionModule.useScraperExecution(
    execution.scraperId,
    execution.mode,
  )

  const executionTree = useMemo(
    () =>
      executionData?.execution
        ? parseScraperExecutionAsTree(parseScraperExecution(executionData?.execution))
        : null,
    [executionData?.execution],
  )

  return (
    executionTree && (
      <HorizontallyScrollableContainer
        maxWidth="calc(100% + 2rem)"
        alignItems="flex-start"
        pt="1rem"
        mt="-1rem"
        mx="-1rem"
        px="1rem"
      >
        <ExecutionTree executionTree={executionTree} />
      </HorizontallyScrollableContainer>
    )
  )
}
