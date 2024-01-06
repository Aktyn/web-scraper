import { Fragment, type ReactNode } from 'react'
import { Box } from '@mui/material'
import {
  DataSourceColumnType,
  RoutineExecutionType,
  upsertStandaloneExecutionPlanSchema,
  type DataSourceFilter,
  type Routine,
} from '@web-scraper/common'
import { numberConditions, stringConditions } from './DataSourceFilterForm'
import { BooleanValue } from '../table/BooleanValue'

interface ExecutionPlanTextProps {
  executionPlan: Routine['executionPlan']
}

export const ExecutionPlanText = ({ executionPlan }: ExecutionPlanTextProps) => {
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
