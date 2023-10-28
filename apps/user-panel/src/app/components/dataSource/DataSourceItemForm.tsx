import { useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { AddRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { FormControl, FormHelperText, InputAdornment, Stack } from '@mui/material'
import {
  DataSourceColumnType,
  type DataSourceItem,
  type DataSourceStructure,
  upsertDataSourceItemSchema,
  type UpsertDataSourceItemSchema,
} from '@web-scraper/common'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { DataSourceColumnTypeIcon } from './DataSourceColumnTypeIcon'
import { useApiRequest } from '../../hooks/useApiRequest'
import { FormInput } from '../form/FormInput'

interface DataSourceItemFormProps {
  dataSource: DataSourceStructure
  dataSourceItem?: DataSourceItem | null
  onSuccess?: () => void
}

export const DataSourceItemForm = ({
  dataSource,
  dataSourceItem,
  onSuccess,
}: DataSourceItemFormProps) => {
  const createDataSourceItemRequest = useApiRequest(window.electronAPI.createDataSourceItem)
  const updateDataSourceItemRequest = useApiRequest(window.electronAPI.updateDataSourceItem)

  const form = useForm({
    resolver: yupResolver(upsertDataSourceItemSchema),
    defaultValues: dataSourceItem
      ? {
          data: dataSourceItem.data,
        }
      : {
          data: dataSource.columns.map((column) => ({
            columnName: column.name,
            value: null,
          })),
        },
  })

  const onSubmit = useCallback(
    (data: UpsertDataSourceItemSchema) => {
      if (dataSourceItem) {
        updateDataSourceItemRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site tag updated' })
              onSuccess?.()
            },
          },
          dataSource.name,
          dataSourceItem.id,
          data,
        )
      } else {
        createDataSourceItemRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site tag created' })
              onSuccess?.()
            },
          },
          dataSource.name,
          data,
        )
      }
    },
    [
      createDataSourceItemRequest,
      dataSource.name,
      dataSourceItem,
      onSuccess,
      updateDataSourceItemRequest,
    ],
  )

  return (
    <Stack flexGrow={1} p={2} gap={2} component="form" onSubmit={form.handleSubmit(onSubmit)}>
      <FormProvider {...form}>
        <ColumnsValuesForm dataSource={dataSource} />
      </FormProvider>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        justifySelf="flex-end"
        mt="auto"
      >
        <LoadingButton
          variant="outlined"
          color="primary"
          type="submit"
          endIcon={<AddRounded />}
          disabled={!dataSource.columns.length}
          loading={createDataSourceItemRequest.submitting || updateDataSourceItemRequest.submitting}
          loadingPosition="end"
        >
          {dataSourceItem ? 'Update' : 'Create'}
        </LoadingButton>
      </Stack>
    </Stack>
  )
}

const ColumnsValuesForm = ({ dataSource }: { dataSource: DataSourceStructure }) => {
  const form = useFormContext<UpsertDataSourceItemSchema>()
  const columnsFields = useFieldArray<UpsertDataSourceItemSchema, 'data'>({
    name: 'data',
  })
  const error = form.getFieldState('data').error

  return (
    <FormControl error={!!error}>
      <Stack justifyContent="flex-start" alignItems="stretch" rowGap="0.5rem">
        {columnsFields.fields.map((field, index) => {
          const columnType =
            getColumnType(dataSource, field.columnName) ?? DataSourceColumnType.TEXT

          return (
            <FormInput
              key={field.id}
              name={`data.${index}.value`}
              form={form}
              label={columnsFields.fields[index].columnName}
              type={
                [DataSourceColumnType.INTEGER, DataSourceColumnType.REAL].includes(columnType)
                  ? 'number'
                  : 'text'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DataSourceColumnTypeIcon type={columnType} />
                  </InputAdornment>
                ),
              }}
              inputProps={
                columnType === DataSourceColumnType.REAL
                  ? {
                      step: 'any',
                    }
                  : {}
              }
            />
          )
        })}
      </Stack>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}

function getColumnType(dataSource: DataSourceStructure, columnName: string) {
  return dataSource.columns.find((column) => column.name === columnName)?.type
}
