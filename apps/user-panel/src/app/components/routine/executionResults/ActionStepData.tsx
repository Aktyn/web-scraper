import { AccessTimeRounded, WarningRounded } from '@mui/icons-material'
import { Stack, Typography } from '@mui/material'
import {
  ActionStepType,
  SaveDataType,
  ValueQueryType,
  isCustomValueQuery,
  isDataSourceValueQuery,
  type ActionStep,
  type RoutineExecutionResult,
  type ValueQuery,
} from '@web-scraper/common'
import {
  actionStepErrorTypeNames,
  actionStepTypeNames,
  saveDataTypeNames,
} from '../../../utils/dictionaries'
import { LabeledValuesList } from '../../common/LabeledValuesList'
import { DataSourceColumnTypeIcon } from '../../dataSource/DataSourceColumnTypeIcon'
import { BooleanValue } from '../../table/BooleanValue'
import { ValueCell } from '../../table/ValueCell'

interface ActionStepDataProps {
  step: ActionStep
  source: RoutineExecutionResult['source']
}

export const ActionStepData = ({ step, source }: ActionStepDataProps) => {
  switch (step.type) {
    case ActionStepType.WAIT:
      return (
        <LabeledValuesList
          data={[
            {
              label: 'Duration',
              value: formatTimeout(step.data.duration),
            },
          ]}
        />
      )
    case ActionStepType.WAIT_FOR_ELEMENT:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Element',
              value: trimJsPath(step.data.element),
            },
            {
              label: 'Timeout',
              value: formatTimeout(step.data.timeout),
            },
          ]}
        />
      )
    case ActionStepType.FILL_INPUT:
    case ActionStepType.SELECT_OPTION:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Element',
              value: trimJsPath(step.data.element),
            },
            {
              label: 'Value query',
              value: step.data.valueQuery,
            },
            {
              label: 'Input value',
              value: <ParsedValueQuery valueQuery={step.data.valueQuery} source={source} />,
            },
            {
              label: 'Timeout',
              value: formatTimeout(step.data.waitForElementTimeout),
            },
          ]}
        />
      )
    case ActionStepType.PRESS_BUTTON:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Element',
              value: trimJsPath(step.data.element),
            },
            {
              label: 'Element timeout',
              value: formatTimeout(step.data.waitForElementTimeout),
            },
            {
              label: 'Wait for navigation',
              value: <BooleanValue value={!!step.data.waitForNavigation} />,
            },
            {
              label: 'Navigation timeout',
              value: formatTimeout(step.data.waitForNavigationTimeout),
            },
          ]}
        />
      )
    case ActionStepType.SAVE_TO_DATA_SOURCE:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Data source query',
              value: step.data.dataSourceQuery,
            },
            {
              label: 'Save data type',
              value: saveDataTypeNames[step.data.saveDataType],
            },
            {
              label: 'Value',
              value:
                step.data.saveDataType === SaveDataType.CURRENT_TIMESTAMP ? (
                  <AccessTimeRounded fontSize="small" />
                ) : step.data.saveDataType === SaveDataType.CUSTOM ? (
                  step.data.saveToDataSourceValue
                ) : step.data.saveDataType === SaveDataType.ELEMENT_CONTENT ? (
                  trimJsPath(step.data.saveToDataSourceValue)
                ) : null,
            },
          ]}
        />
      )
    case ActionStepType.CHECK_ERROR:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Element',
              value: trimJsPath(step.data.element),
            },
            {
              label: 'Element timeout',
              value: formatTimeout(step.data.waitForElementTimeout),
            },
            ...step.data.mapError.map((mapError, index) => ({
              label: `Mapped error #${index + 1}`,
              value: (
                <Stack>
                  <Typography variant="body2" fontWeight="bold" color="error.light">
                    {actionStepErrorTypeNames[mapError.errorType]}
                  </Typography>
                  {mapError.content && (
                    <Typography variant="body2" color="error.light">
                      {mapError.content}
                    </Typography>
                  )}
                </Stack>
              ),
            })),
          ]}
        />
      )
    case ActionStepType.CHECK_SUCCESS:
      return (
        <LabeledValuesList
          skipEmptyValues
          data={[
            {
              label: 'Element',
              value: trimJsPath(step.data.element),
            },
            {
              label: 'Element timeout',
              value: formatTimeout(step.data.waitForElementTimeout),
            },
            ...step.data.mapSuccess.map((mapSuccess, index) => ({
              label: `Mapped success #${index + 1}`,
              value: mapSuccess.content,
            })),
          ]}
        />
      )
  }
  return (
    <Stack direction="row" alignItems="center" gap="0.5rem">
      <WarningRounded color="warning" />
      <Typography
        variant="body2"
        color="warning.main"
        textAlign="center"
        whiteSpace="nowrap"
        fontWeight="bold"
      >
        Incorrect step type:
        {/* @ts-expect-error unsupported action step type */}
        {'type' in step && <strong>{actionStepTypeNames[step.type as never] ?? step.type}</strong>}
      </Typography>
    </Stack>
  )
}

interface ParsedValueQueryProps {
  valueQuery: ValueQuery
  source: RoutineExecutionResult['source']
}

const ParsedValueQuery = ({ valueQuery, source }: ParsedValueQueryProps) => {
  if (isCustomValueQuery(valueQuery)) {
    const stringValue = valueQuery.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), '')
    return stringValue
  }

  const NA = (
    <Typography variant="body2" color="text.secondary">
      N/A
    </Typography>
  )

  if (isDataSourceValueQuery(valueQuery)) {
    const [, queryDataSourceName, queryColumnName] = valueQuery.split('.')
    if (source?.dataSource.name === queryDataSourceName) {
      const item = source.item.data.find((item) => item.columnName === queryColumnName)
      if (!item) {
        return NA
      }
      const column = source.dataSource.columns.find((column) => column.name === item.columnName)
      return (
        <Stack direction="row" alignItems="center" gap="0.5rem">
          {column && <DataSourceColumnTypeIcon type={column.type} sx={{ opacity: 0.5 }} />}
          <ValueCell component="div" sx={{ border: 'none', p: 0, whiteSpace: 'nowrap' }}>
            {item.value}
          </ValueCell>
        </Stack>
      )
    }
  }

  return NA
}

function trimJsPath(jsPath?: string, maxLength = 24) {
  if (!jsPath) {
    return null
  }
  return jsPath.length > maxLength ? `...${jsPath.slice(-maxLength + 3)}` : jsPath
}

function formatTimeout(timeout?: number) {
  if (!timeout) {
    return null
  }
  return `${timeout} ms`
}
