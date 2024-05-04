import { Fragment } from 'react'
import { Box, Stack } from '@mui/material'
import { ScraperExecutionScope } from '@web-scraper/common'
import { ScraperExecutionItemLabel } from './ScraperExecutionItemLabel'
import type { ParsedScraperExecutionTree } from './helpers'

interface ExecutionTreeProps {
  executionTree: ParsedScraperExecutionTree
}

export const ExecutionTree = ({ executionTree }: ExecutionTreeProps) => {
  const isActionScope = executionTree.root.start.scope === ScraperExecutionScope.ACTION

  //TODO: flow has maximum one action so it can be joined in the UI
  return (
    <Stack direction="row" alignItems="flex-start" gap="1rem">
      <ScraperExecutionItemLabel item={executionTree.root} />
      {!!executionTree.nodes?.length &&
        (isActionScope ? (
          executionTree.nodes.map((node, index) => (
            <Fragment key={index}>
              <Box>Horizontal line</Box>
              <ExecutionTree executionTree={node} />
            </Fragment>
          ))
        ) : (
          <>
            <Box>Horizontal line</Box>
            <Stack direction="column" gap="1rem" justifyContent="flex-start">
              {executionTree.nodes.map((node, index) => (
                <Fragment key={index}>
                  {index > 0 && <Box>Vertical line</Box>}
                  <ExecutionTree executionTree={node} />
                </Fragment>
              ))}
            </Stack>
          </>
        ))}
    </Stack>
  )
}
