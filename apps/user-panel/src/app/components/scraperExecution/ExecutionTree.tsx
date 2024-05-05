import { useState } from 'react'
import { ChevronLeftRounded } from '@mui/icons-material'
import { Box, Collapse, IconButton, Stack, Tooltip, alpha, lighten, useTheme } from '@mui/material'
import { ScraperExecutionScope } from '@web-scraper/common'
import { ScraperExecutionItemContent } from './ScraperExecutionItemContent'
import { ScraperExecutionItemLabel } from './ScraperExecutionItemLabel'
import type { ParsedScraperExecutionTree } from './helpers'
import { AnimeWithRef } from '../animation/AnimeWithRef'
import { AutoSizer } from '../common/AutoSizer'
import { AnimatedBorder } from '../common/effect/AnimatedBorder'

interface ExecutionTreeProps {
  executionTree: ParsedScraperExecutionTree
  root?: boolean
  nodeIndex?: number
  collapse?: boolean
}

export const ExecutionTree = ({
  executionTree,
  root = true,
  nodeIndex = 0,
  collapse = false,
}: ExecutionTreeProps) => {
  const theme = useTheme()

  const isActionScope = executionTree.root.start.scope === ScraperExecutionScope.ACTION

  const [collapseChildren, setCollapseChildren] = useState(false)

  const active =
    executionTree.root.start.scope === ScraperExecutionScope.ACTION_STEP &&
    !executionTree.root.finish

  return (
    <Collapse in={!collapse} orientation="horizontal" unmountOnExit>
      <Stack direction="row" alignItems="flex-start" columnGap="0.5rem" pt="12px" mt="-12px">
        {!root && <HorizontalLine half={nodeIndex > 0} />}
        <AnimatedBorder
          active={active}
          borderRadius="0.5rem"
          animationDuration={800}
          offset={-8}
          rectProps={{
            strokeWidth: 2,
            strokeDasharray: [12, 9],
            stroke: theme.palette.secondary.main,
          }}
        >
          <Stack
            alignItems="flex-start"
            rowGap="0.5rem"
            p="8px"
            m="-8px"
            borderRadius="0.5rem"
            sx={{
              transition: (theme) => theme.transitions.create('background-color'),
              backgroundColor: alpha(theme.palette.secondary.main, active ? 0.2 : 0),
            }}
          >
            <Stack direction="row" alignItems="center" gap="0.5rem" height="1.5rem">
              <ScraperExecutionItemLabel
                item={executionTree.root}
                color={(theme) =>
                  executionTree.root.finish
                    ? theme.palette.text.primary
                    : theme.palette.secondary.main
                }
              />
              {isActionScope && !!executionTree.nodes?.length && (
                <Tooltip title={collapseChildren ? 'Show action steps' : 'Hide action steps'}>
                  <IconButton size="small" onClick={() => setCollapseChildren((v) => !v)}>
                    <AnimeWithRef
                      easing="spring(0.7, 100, 10, 0)"
                      rotate={collapseChildren ? 180 : 0}
                    >
                      <ChevronLeftRounded />
                    </AnimeWithRef>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <ScraperExecutionItemContent item={executionTree.root} />
          </Stack>
        </AnimatedBorder>
        {!!executionTree.nodes?.length &&
          (isActionScope ? (
            executionTree.nodes.map((node, index) => (
              <ExecutionTree
                key={index}
                executionTree={node}
                root={false}
                collapse={collapseChildren}
              />
            ))
          ) : (
            <Stack direction="column" gap="1rem" justifyContent="flex-start" position="relative">
              {executionTree.nodes.map((node, index) => (
                <AutoSizer key={index}>
                  {({ height }) => (
                    <>
                      <ExecutionTree
                        executionTree={node}
                        root={false}
                        nodeIndex={index}
                        collapse={collapseChildren}
                      />
                      {index > 0 && index === (executionTree.nodes?.length ?? 0) - 1 && (
                        <Stack
                          flexGrow={1}
                          alignItems="center"
                          minHeight="4rem"
                          sx={{
                            position: 'absolute',
                            left: '2rem',
                            top: '0.75rem',
                            bottom: `calc(${height}px - 0.75rem)`,
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: (theme) => lighten(theme.palette.divider, 0.2),
                              width: '1px',
                              height: '100%',
                            }}
                          />
                        </Stack>
                      )}
                    </>
                  )}
                </AutoSizer>
              ))}
            </Stack>
          ))}
      </Stack>
    </Collapse>
  )
}

const HorizontalLine = ({ half }: { half?: boolean }) => (
  <Stack justifyContent="center" alignItems="flex-end" minWidth="4rem" height="1.5rem">
    <Box
      sx={{
        backgroundColor: (theme) => lighten(theme.palette.divider, 0.2),
        height: '1px',
        width: half ? '50%' : '100%',
      }}
    />
  </Stack>
)
