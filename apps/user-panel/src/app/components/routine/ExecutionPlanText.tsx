import { Fragment, useCallback, useRef, type ReactNode, useMemo } from 'react'
import { CodeRounded } from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  DataSourceColumnType,
  RoutineExecutionType,
  upsertStandaloneExecutionPlanSchema,
  type DataSourceFilter,
  type Routine,
  dataSourceFiltersToSqlite,
} from '@web-scraper/common'
import * as prism from 'prismjs'
import { numberConditions, stringConditions } from './DataSourceFilterForm'
import { CustomPopover, type CustomPopoverRef } from '../common/CustomPopover'
import { BooleanValue } from '../table/BooleanValue'

import 'prismjs/components/prism-sql.js'
import 'prismjs/themes/prism-dark.css'

interface ExecutionPlanTextProps {
  executionPlan: Routine['executionPlan']
}

export const ExecutionPlanText = ({ executionPlan }: ExecutionPlanTextProps) => {
  const sqlitePreviewPopoverRef = useRef<CustomPopoverRef>(null)
  const sqliteCodeContainerRef = useRef<HTMLPreElement>(null)

  const filters =
    executionPlan.type === RoutineExecutionType.MATCH_SEQUENTIALLY ? executionPlan.filters : null

  const sql = useMemo(() => {
    if (!filters) {
      return ''
    }
    return dataSourceFiltersToSqlite(filters)
  }, [filters])

  const generatePreview = useCallback(() => {
    if (!sqliteCodeContainerRef.current || !sql) {
      return
    }

    sqliteCodeContainerRef.current.innerHTML = prism.highlight(sql, prism.languages.sql, 'sql')
  }, [sql])

  switch (executionPlan.type) {
    case RoutineExecutionType.STANDALONE: {
      const repeat = executionPlan.repeat ?? upsertStandaloneExecutionPlanSchema.getDefault().repeat
      return (
        <>
          Executes <Strong>{repeat}</Strong> time{repeat > 1 ? 's' : ''}
        </>
      )
    }
    case RoutineExecutionType.SPECIFIC_IDS:
      return (
        <>
          Executes for rows with id <JoinedArrayItems array={executionPlan.ids} /> in{' '}
          <Strong>DataSource.{executionPlan.dataSourceName}</Strong>
        </>
      )
    case RoutineExecutionType.EXCEPT_SPECIFIC_IDS:
      return (
        <>
          Executes for each row in <Strong>DataSource.{executionPlan.dataSourceName}</Strong> except
          those with id <JoinedArrayItems array={executionPlan.ids} />
        </>
      )
    case RoutineExecutionType.MATCH_SEQUENTIALLY:
      return (
        <>
          Executes for each row in <Strong>DataSource.{executionPlan.dataSourceName}</Strong>{' '}
          matching the condition:{' '}
          <JoinedArrayItems
            array={executionPlan.filters.map((filter, index) => (
              <Fragment key={index}>
                {filter.columnName}{' '}
                <WhereLabel where={filter.where} columnType={filter.columnType} />
              </Fragment>
            ))}
            separator=" and "
            lastSeparator=" and "
          />
          <Button
            variant="text"
            size="small"
            endIcon={<CodeRounded />}
            onClick={(event) => {
              sqlitePreviewPopoverRef.current?.open(event.currentTarget)
              setTimeout(generatePreview, 0)
            }}
            sx={{ ml: '0.5rem' }}
          >
            Preview SQLite
          </Button>
          <CustomPopover
            ref={sqlitePreviewPopoverRef}
            TransitionProps={{ unmountOnExit: true }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            slotProps={{
              paper: {
                sx: {
                  display: 'flex',
                },
              },
            }}
          >
            <Stack
              gap="0.5rem"
              component="pre"
              sx={{
                m: 0,
                p: '1rem',
                overflow: 'auto',
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="body1" fontWeight="bold">
                Generated SQLite conditions to filter data source
              </Typography>
              <Box ref={sqliteCodeContainerRef}>{sql}</Box>
            </Stack>
          </CustomPopover>
          <br />
          Maximum iterations: <Strong>{executionPlan.maximumIterations ?? 'no limit'}</Strong>
        </>
      )
  }
  return 'Unknown execution plan type'
}

interface JoinedArrayItemsProps {
  array: ReactNode[]
  separator?: ReactNode
  lastSeparator?: ReactNode
}

const JoinedArrayItems = ({
  array,
  separator = ', ',
  lastSeparator = ' and ',
}: JoinedArrayItemsProps) => {
  return array.map((item, index) => (
    <Fragment key={index}>
      <Strong>{item}</Strong>
      {index < array.length - 2 ? separator : index === array.length - 2 ? lastSeparator : ''}
    </Fragment>
  ))
}

interface WhereLabelProps {
  where: DataSourceFilter['where']
  columnType: DataSourceColumnType
}

const WhereLabel = ({ where, columnType }: WhereLabelProps) => {
  if (typeof where === 'string') {
    return where
  }
  if ('AND' in where || 'OR' in where) {
    return '<<<unsupported nested condition>>>'
  }

  const conditions = columnType === DataSourceColumnType.TEXT ? stringConditions : numberConditions
  const conditionKey = Object.keys(where)[0] as keyof typeof conditions
  const isArrayValue = ['number[]', 'string[]'].includes(conditions[conditionKey].valueType)
  const isBooleanValue = conditions[conditionKey].valueType === 'boolean'

  if (!conditionKey) {
    return '<<<unsupported condition>>>'
  }

  return (
    <>
      <Box component="span" style={{ textDecoration: 'underline', textTransform: 'lowercase' }}>
        {conditions[conditionKey].label}
      </Box>{' '}
      {isArrayValue ? (
        `[${(where[conditionKey] as string[]).join(', ')}]`
      ) : isBooleanValue ? (
        <BooleanValue
          value={where[conditionKey] as boolean}
          component="span"
          sx={{ display: 'inline-flex', verticalAlign: 'bottom' }}
        />
      ) : columnType === DataSourceColumnType.TEXT ? (
        `"${where[conditionKey]}"`
      ) : (
        where[conditionKey]
      )}
    </>
  )
}

const Strong = ({ children }: { children: ReactNode }) => (
  <Box component="strong" color={(theme) => theme.palette.secondary.main}>
    {children}
  </Box>
)
