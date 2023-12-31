import { useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  AddRounded,
  DeleteRounded,
  FormatListBulletedRounded,
  WarningRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  DataSourceColumnType,
  upsertDataSourceStructureSchema,
  type DataSourceStructure,
  type UpsertDataSourceStructureSchema,
} from '@web-scraper/common'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { useApiRequest } from '../../hooks/useApiRequest'
import { dataSourceColumnTypeNames } from '../../utils/dictionaries'
import { ConfirmableButton } from '../common/button/ConfirmableButton'
import { FormInput } from '../form/FormInput'

export enum DataSourceSuccessAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

interface DataSourceFormProps {
  dataSource?: DataSourceStructure
  onSuccess?: (action: DataSourceSuccessAction) => void
}

export const DataSourceForm = ({ dataSource, onSuccess }: DataSourceFormProps) => {
  const createDataSourceRequest = useApiRequest(window.electronAPI.createDataSource)
  const updateDataSourceRequest = useApiRequest(window.electronAPI.updateDataSource)
  const deleteDataSourceRequest = useApiRequest(window.electronAPI.deleteDataSource)

  const form = useForm({
    resolver: yupResolver(upsertDataSourceStructureSchema),
    defaultValues: dataSource
      ? { name: dataSource.name, columns: dataSource.columns }
      : { name: '', columns: [] },
  })

  const name = form.watch('name')
  const columns = form.watch('columns')

  const onSubmit = useCallback(
    (data: UpsertDataSourceStructureSchema) => {
      if (dataSource) {
        updateDataSourceRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Data source modified' })
              onSuccess?.(DataSourceSuccessAction.UPDATED)
            },
          },
          dataSource.name,
          data,
        )
      } else {
        createDataSourceRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Data source created' })
              onSuccess?.(DataSourceSuccessAction.CREATED)
            },
          },
          data,
        )
      }
    },
    [createDataSourceRequest, dataSource, onSuccess, updateDataSourceRequest],
  )

  const deleteDataSource = useCallback(
    (dataSource: DataSourceStructure) => {
      deleteDataSourceRequest.submit(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'success', message: 'Data source deleted' })
            onSuccess?.(DataSourceSuccessAction.DELETED)
          },
        },
        dataSource.name,
      )
    },
    [deleteDataSourceRequest, onSuccess],
  )

  return (
    <Stack
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
      flexGrow={1}
      rowGap="1rem"
      minWidth="24rem"
      overflow="hidden"
    >
      <Stack rowGap="1rem" p="1rem" overflow="auto">
        <FormInput name="name" form={form} label="Name" required />
        <FormProvider {...form}>
          <ColumnsDefinitionsForm />
        </FormProvider>
      </Stack>
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        justifySelf="flex-end"
        p="1rem"
        pt={0}
        mt="auto"
        gap="1rem"
      >
        <Tooltip title={dataSource ? 'Updating the data source will remove all its content' : ''}>
          <Box>
            <ConfirmableButton
              variant="outlined"
              color="primary"
              endIcon={dataSource ? <WarningRounded /> : <AddRounded />}
              disabled={!name || !columns?.length}
              loading={createDataSourceRequest.submitting || updateDataSourceRequest.submitting}
              loadingPosition="end"
              onConfirm={(event) => form.handleSubmit(onSubmit)(event).catch(console.error)}
            >
              {dataSource ? 'Update' : 'Create'}
            </ConfirmableButton>
          </Box>
        </Tooltip>
        {dataSource && (
          <ConfirmableButton
            variant="outlined"
            color="primary"
            endIcon={<DeleteRounded />}
            loading={deleteDataSourceRequest.submitting}
            loadingPosition="end"
            onConfirm={() => deleteDataSource(dataSource)}
          >
            Delete
          </ConfirmableButton>
        )}
      </Stack>
    </Stack>
  )
}

const ColumnsDefinitionsForm = () => {
  const form = useFormContext<UpsertDataSourceStructureSchema>()
  const columnsFields = useFieldArray<UpsertDataSourceStructureSchema, 'columns'>({
    name: 'columns',
  })
  const error = form.getFieldState('columns').error

  return (
    <FormControl error={!!error}>
      <Stack justifyContent="flex-start" alignItems="stretch" rowGap="0.5rem">
        {columnsFields.fields.map((field, index) => (
          <Stack
            key={field.id}
            direction="row"
            alignItems="baseline"
            justifyContent="stretch"
            columnGap="1rem"
          >
            <FormInput
              name={`columns.${index}.name`}
              form={form}
              label="Name"
              required
              sx={{ minWidth: '12rem' }}
            />
            <FormInput
              name={`columns.${index}.type`}
              form={form}
              label="Type"
              required
              select
              defaultValue={field.type}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FormatListBulletedRounded />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            >
              {Object.values(DataSourceColumnType).map((columnType) => (
                <MenuItem key={columnType} value={columnType}>
                  {dataSourceColumnTypeNames[columnType]}
                </MenuItem>
              ))}
            </FormInput>
            <Stack justifyContent="center" alignSelf="center" ml="auto">
              <IconButton
                size="small"
                color="inherit"
                onClick={() => {
                  columnsFields.remove(index)
                }}
              >
                <DeleteRounded />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
      {error && <FormHelperText>{error.message}</FormHelperText>}
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        endIcon={<AddRounded />}
        onClick={() => {
          columnsFields.append({
            name: '',
            type: DataSourceColumnType.TEXT,
          })
        }}
        sx={{ mx: 'auto', mt: '1rem' }}
      >
        Add column
      </Button>
    </FormControl>
  )
}
