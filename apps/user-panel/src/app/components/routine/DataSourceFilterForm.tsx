import { Fragment, useState } from 'react'
import {
  AddRounded,
  DataArrayRounded,
  DeleteRounded,
  FormatListBulletedRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  LabelRounded,
  NumbersRounded,
} from '@mui/icons-material'
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DataSourceColumnType,
  type DataSourceStructure,
  type UpsertDataSourceFilterSchema,
  type UpsertDataSourceNumberFilterSchema,
  type UpsertDataSourceStringFilterSchema,
  type UpsertRoutineSchema,
} from '@web-scraper/common'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { DataSourceColumnTypeIcon } from '../dataSource/DataSourceColumnTypeIcon'
import { FormInput } from '../form/FormInput'
import { FormSwitch } from '../form/FormSwitch'

interface DataSourceFilterFormProps {
  dataSourceStructure?: DataSourceStructure
}

export const DataSourceFilterForm = ({ dataSourceStructure }: DataSourceFilterFormProps) => {
  const form = useFormContext<UpsertRoutineSchema>()

  const filters = useFieldArray({
    control: form.control,
    name: 'executionPlan.filters',
    keyName: 'fieldKey',
  })

  return (
    <>
      <InputLabel variant="standard" margin="dense">
        Data source filters
      </InputLabel>
      <Stack>
        {filters.fields.length && dataSourceStructure ? (
          <Stack>
            {filters.fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                <FilterFields
                  fieldName={`executionPlan.filters.${index}`}
                  dataSourceStructure={dataSourceStructure}
                  onRemove={() => filters.remove(index)}
                />
                <Stack my="0.5rem" alignSelf="center" alignItems="center">
                  <KeyboardArrowUpRounded fontSize="small" />
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    AND
                  </Typography>
                  <KeyboardArrowDownRounded fontSize="small" />
                </Stack>
              </Fragment>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No filters specified
          </Typography>
        )}
        <Tooltip title="Add column filter">
          <Box alignSelf="center">
            <IconButton disabled={!dataSourceStructure} onClick={() => filters.append({})}>
              <AddRounded />
            </IconButton>
          </Box>
        </Tooltip>
      </Stack>
    </>
  )
}

interface FilterFieldsProps {
  fieldName: `executionPlan.filters.${number}`
  dataSourceStructure: DataSourceStructure
  onRemove: () => void
}

const FilterFields = ({ fieldName, dataSourceStructure, onRemove }: FilterFieldsProps) => {
  const form = useFormContext<UpsertRoutineSchema>()
  const columnNameFormValue = form.watch(`${fieldName}.columnName`)
  const where = form.watch(`${fieldName}.where`)

  const [columnName, setColumnName] = useState<string | undefined>(columnNameFormValue)
  const column = dataSourceStructure.columns.find((column) => column.name === columnName)

  const isNumberColumn =
    column?.type === DataSourceColumnType.INTEGER || column?.type === DataSourceColumnType.REAL
  const formWhereCondition =
    (!where || typeof where === 'string' ? undefined : Object.keys(where).at(0)) ?? 'equals'

  //TODO: custom condition (for raw string value)
  const [stringCondition, setStringCondition] = useState<StringConditionKey>(
    isNumberColumn ? 'equals' : (formWhereCondition as never),
  )
  const [numberCondition, setNumberCondition] = useState<NumberConditionKey>(
    isNumberColumn ? (formWhereCondition as never) : 'equals',
  )

  const condition = isNumberColumn
    ? numberConditions[numberCondition]
    : stringConditions[stringCondition]
  //TODO: support for nested AND/OR groups ( ${fieldName}.where.OR.0... )
  const valueFieldName = `${fieldName}.where.${
    isNumberColumn ? numberCondition : stringCondition
  }` as const

  return (
    <Stack direction="row" alignItems="baseline" justifyContent="space-between" columnGap="0.5rem">
      <Stack flexGrow={1} gap="1rem">
        <Controller
          name={fieldName}
          control={form.control}
          render={({ field, fieldState }) => {
            const filterField = field.value as UpsertDataSourceFilterSchema

            if (!('columnName' in filterField) || !filterField.columnName) {
              setColumnName(undefined)
            }

            const handleColumnChange = (columnName: string) => {
              const column = dataSourceStructure.columns.find(
                (column) => column.name === columnName,
              )
              if (column) {
                field.onChange({
                  columnName: column.name,
                  columnType: column.type,
                })
                setColumnName(columnName)
              }
            }

            return (
              <FormControl error={!!fieldState.error} sx={{ justifySelf: 'flex-end' }}>
                <InputLabel variant="standard" margin="dense" shrink required>
                  Column
                </InputLabel>
                <TextField
                  variant="standard"
                  label=" "
                  select
                  error={!!fieldState.error}
                  value={
                    filterField && 'columnName' in filterField ? filterField.columnName ?? '' : ''
                  }
                  onChange={(event) => handleColumnChange(event.target.value)}
                  onBlur={field.onBlur}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FormatListBulletedRounded />
                      </InputAdornment>
                    ),
                  }}
                >
                  {/* TODO: support for ID column */}
                  {dataSourceStructure.columns.map((column) => (
                    <MenuItem key={column.name} value={column.name}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-start"
                        columnGap="0.5rem"
                      >
                        <DataSourceColumnTypeIcon type={column.type} sx={{ opacity: 0.5 }} />
                        <Box>{column.name}</Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )
          }}
        />
        <TextField
          variant="standard"
          label="Condition"
          select
          disabled={!columnName}
          required
          value={isNumberColumn ? numberCondition : stringCondition}
          onChange={(event) => {
            isNumberColumn
              ? setNumberCondition(event.target.value as NumberConditionKey)
              : setStringCondition(event.target.value as StringConditionKey)

            form.setValue(`${fieldName}.where`, { [event.target.value]: undefined })
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FormatListBulletedRounded />
              </InputAdornment>
            ),
          }}
        >
          {Object.entries(isNumberColumn ? numberConditions : stringConditions).map(
            ([conditionKey, { label }]) => (
              <MenuItem key={conditionKey} value={conditionKey}>
                {label}
              </MenuItem>
            ),
          )}
        </TextField>
        {(condition.valueType === 'number' || condition.valueType === 'text') && (
          <FormInput
            form={form}
            name={valueFieldName}
            label={condition.label}
            type={condition.valueType}
            disabled={!columnName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {condition.valueType === 'number' ? <NumbersRounded /> : <LabelRounded />}
                </InputAdornment>
              ),
            }}
          />
        )}
        {(condition.valueType === 'number[]' || condition.valueType === 'string[]') && (
          <Controller
            name={valueFieldName}
            control={form.control}
            disabled={!columnName}
            render={({ field, fieldState }) => {
              const arrayValue = Array.isArray(field.value) ? field.value : []

              const handleChange = (value: string) => {
                switch (condition.valueType) {
                  case 'number[]':
                    if (value.endsWith(', ')) {
                      field.onChange(arrayValue.slice(0, -1))
                    } else {
                      const numbers = value.split(',').map(Number)
                      if (!numbers.some(isNaN)) {
                        field.onChange(numbers)
                      }
                    }
                    break
                  case 'string[]':
                    if (value.endsWith(', ')) {
                      field.onChange(arrayValue.slice(0, -1))
                    } else {
                      field.onChange(value.split(',').map((item) => item.trim()))
                    }
                    break
                }
              }

              const handleBlur = (value: string) => {
                switch (condition.valueType) {
                  case 'number[]':
                    {
                      const numbers = value
                        .split(',')
                        .map(Number)
                        .filter((n) => !isNaN(n))
                      field.onChange(numbers)
                    }
                    break
                  case 'string[]':
                    field.onChange(
                      value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                    break
                }
                field.onBlur()
              }

              return (
                <FormControl error={!!fieldState.error} sx={{ justifySelf: 'flex-end' }}>
                  <InputLabel variant="standard" margin="dense" shrink>
                    {condition.label}
                  </InputLabel>
                  <TextField
                    variant="standard"
                    label=" "
                    error={!!fieldState.error}
                    value={arrayValue.join(', ')}
                    onChange={(event) => handleChange(event.target.value)}
                    onBlur={(event) => handleBlur(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DataArrayRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )
            }}
          />
        )}
        {condition.valueType === 'boolean' && (
          <FormSwitch<UpsertRoutineSchema>
            fieldName={valueFieldName}
            label={condition.label}
            disabled={!columnName}
          />
        )}
      </Stack>
      <IconButton onClick={onRemove}>
        <DeleteRounded />
      </IconButton>
    </Stack>
  )
}

type ConditionValueFieldType = 'number' | 'text' | 'boolean' | 'string[]' | 'number[]'

export type StringConditionKey = keyof Exclude<UpsertDataSourceStringFilterSchema, string>
export const stringConditions: {
  [key in StringConditionKey]: { label: string; valueType: ConditionValueFieldType }
} = {
  equals: { label: 'Equals', valueType: 'text' },
  notEquals: { label: 'Not equals', valueType: 'text' },
  in: { label: 'In', valueType: 'string[]' },
  notIn: { label: 'Not in', valueType: 'string[]' },
  contains: { label: 'Contains', valueType: 'text' },
  startsWith: { label: 'Starts with', valueType: 'text' },
  endsWith: { label: 'Ends with', valueType: 'text' },
  null: { label: 'Is null', valueType: 'boolean' },
  notNull: { label: 'Is not null', valueType: 'boolean' },
}

export type NumberConditionKey = keyof Exclude<UpsertDataSourceNumberFilterSchema, string>
export const numberConditions: {
  [key in NumberConditionKey]: { label: string; valueType: ConditionValueFieldType }
} = {
  equals: { label: 'Equals', valueType: 'number' },
  notEquals: { label: 'Not equals', valueType: 'number' },
  in: { label: 'In', valueType: 'number[]' },
  notIn: { label: 'Not in', valueType: 'number[]' },
  lt: { label: 'Less than', valueType: 'number' },
  lte: { label: 'Less than or equal to', valueType: 'number' },
  gt: { label: 'Greater than', valueType: 'number' },
  gte: { label: 'Greater than or equal to', valueType: 'number' },
  null: { label: 'Is null', valueType: 'boolean' },
  notNull: { label: 'Is not null', valueType: 'boolean' },
}
