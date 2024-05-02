import { Button, Stack } from '@mui/material'
import { ViewTransition } from '../../components/animation/ViewTransition'
import type { ViewComponentProps } from '../helpers'

const DashboardView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  //TODO: show currently running procedures/routines/chores (Scraper executions) for monitoring/preview purposes
  // const {scraperExecutions} = ScraperExecutionModule.useScraperExecutionContext()

  return (
    <Stack alignItems="center" p="2rem" spacing="2rem">
      <ViewTransition>
        <Button variant="contained" color="primary">
          NOOP
        </Button>
      </ViewTransition>
    </Stack>
  )
}
export default DashboardView
