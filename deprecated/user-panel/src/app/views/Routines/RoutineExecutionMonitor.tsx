import { Divider, Stack, Typography, type StackProps } from '@mui/material'
import type { ScraperExecutionScope } from '@web-scraper/common'
import { HorizontallyScrollableContainer } from '../../components/common/HorizontallyScrollableContainer'
import { ExecutionTree } from '../../components/scraperExecution/ExecutionTree'
import type { ParsedScraperExecutionTree } from '../../components/scraperExecution/helpers'

type RoutineExecutionMonitorProps = {
  scraperExecutionTree: ParsedScraperExecutionTree<ScraperExecutionScope.ROUTINE>
  executing: boolean
} & StackProps

export const RoutineExecutionMonitor = ({
  scraperExecutionTree,
  executing,
  ...stackProps
}: RoutineExecutionMonitorProps) => {
  return (
    <Stack gap="1rem" {...stackProps}>
      <Divider />
      <Typography variant="h6" color="text.secondary" fontWeight="bold">
        {executing ? 'Routine is currently running...' : 'Routine execution finished'}
      </Typography>
      <HorizontallyScrollableContainer
        alignItems="flex-start"
        pt="1rem"
        mt="-1rem"
        mx="-1rem"
        px="1rem"
      >
        <ExecutionTree executionTree={scraperExecutionTree} />
      </HorizontallyScrollableContainer>
    </Stack>
  )
}
