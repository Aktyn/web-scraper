import { useCallback, useContext, useState } from 'react'
import { ChecklistRounded, FormatListBulletedRounded, NumbersRounded } from '@mui/icons-material'
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import {
  RoutineExecutionType,
  upsertMatchSequentiallyExecutionPlanSchema,
  upsertSpecificIdsExecutionPlanSchema,
  upsertStandaloneExecutionPlanSchema,
  type DataSourceItem,
  type UpsertRoutineSchema,
} from '@web-scraper/common'
import { Controller, useFormContext } from 'react-hook-form'
import { DataSourceFilterForm } from './DataSourceFilterForm'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { routineExecutionTypeNames } from '../../utils/dictionaries'
import { ToggleIconButton } from '../common/button/ToggleIconButton'
import { DataSourceRowsSelectDialog } from '../dataSource/DataSourceRowsSelectDialog'
import { FormInput } from '../form/FormInput'

export const RoutineExecutionPlanForm = () => {
  const form = useFormContext<UpsertRoutineSchema>()
  const dataSources = useContext(DataSourcesContext)

  const { setValue, getValues } = form
  const type = form.watch('executionPlan.type')
  const dataSourceName = form.watch('executionPlan.dataSourceName')
  const dataSourceStructure = dataSources.find((dataSource) => dataSource.name === dataSourceName)

  const [openDataSourceRowsSelectDialog, setOpenDataSourceRowsSelectDialog] = useState(false)

  const handleExecutionTypeManualChange = useCallback(() => {
    const newType = getValues('executionPlan.type')

    const schema =
      newType === RoutineExecutionType.MATCH_SEQUENTIALLY
        ? upsertMatchSequentiallyExecutionPlanSchema
        : newType === RoutineExecutionType.STANDALONE
          ? upsertStandaloneExecutionPlanSchema
          : upsertSpecificIdsExecutionPlanSchema

    setValue('executionPlan', { ...schema.getDefault(), type: newType }, { shouldDirty: true })
    if (schema !== upsertStandaloneExecutionPlanSchema) {
      setValue('executionPlan.dataSourceName', '', { shouldDirty: true })
    }
  }, [getValues, setValue])

  const handleDataSourceNameManualChange = useCallback(() => {
    if (
      [RoutineExecutionType.SPECIFIC_IDS, RoutineExecutionType.EXCEPT_SPECIFIC_IDS].includes(
        getValues('executionPlan.type'),
      )
    ) {
      setValue('executionPlan.ids', [], { shouldDirty: true })
    }
  }, [getValues, setValue])

  return (
    <Stack gap="1rem">
      <FormInput
        form={form}
        name="executionPlan.type"
        label="Type"
        select
        defaultValue={type ?? RoutineExecutionType.STANDALONE}
        onChange={handleExecutionTypeManualChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FormatListBulletedRounded />
            </InputAdornment>
          ),
        }}
      >
        {Object.values(RoutineExecutionType).map((saveDataType) => (
          <MenuItem key={saveDataType} value={saveDataType}>
            {routineExecutionTypeNames[saveDataType]}
          </MenuItem>
        ))}
      </FormInput>
      {type === RoutineExecutionType.MATCH_SEQUENTIALLY && (
        <FormInput
          form={form}
          name="executionPlan.maximumIterations"
          label="Maximum iterations"
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NumbersRounded />
              </InputAdornment>
            ),
          }}
        />
      )}
      {type === RoutineExecutionType.STANDALONE && (
        <FormInput
          form={form}
          name="executionPlan.repeat"
          label="Repeat"
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NumbersRounded />
              </InputAdornment>
            ),
          }}
        />
      )}
      {[
        RoutineExecutionType.MATCH_SEQUENTIALLY,
        RoutineExecutionType.SPECIFIC_IDS,
        RoutineExecutionType.EXCEPT_SPECIFIC_IDS,
      ].includes(type) && (
        <Tooltip title={dataSources.length ? '' : 'There are no data sources defined'}>
          <Stack flexGrow={1}>
            <FormInput
              key={dataSourceName + type}
              form={form}
              name="executionPlan.dataSourceName"
              label="Data source"
              select
              disabled={!dataSources.length}
              defaultValue={dataSourceName ?? ''}
              required
              fullWidth
              onChange={handleDataSourceNameManualChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FormatListBulletedRounded />
                  </InputAdornment>
                ),
              }}
            >
              {dataSources.map((dataSource) => (
                <MenuItem key={dataSource.name} value={dataSource.name}>
                  {dataSource.name}
                </MenuItem>
              ))}
            </FormInput>
          </Stack>
        </Tooltip>
      )}
      {[RoutineExecutionType.SPECIFIC_IDS, RoutineExecutionType.EXCEPT_SPECIFIC_IDS].includes(
        type,
      ) && (
        <Controller
          name="executionPlan.ids"
          control={form.control}
          render={({ field, fieldState }) => {
            const ids = field.value ?? []

            const handleItemSelect = (item: DataSourceItem) => {
              const newIds = ids.includes(item.id)
                ? ids.filter((id) => id !== item.id)
                : [...ids, item.id].sort((a, b) => a - b)

              field.onChange(newIds)
              field.onBlur()
            }

            return (
              <>
                <FormControl
                  disabled={!dataSourceStructure}
                  error={!!fieldState.error}
                  sx={{ justifySelf: 'flex-end' }}
                >
                  <InputLabel variant="standard" margin="dense" shrink>
                    Selected data source row ids
                  </InputLabel>
                  <TextField
                    variant="standard"
                    label=" "
                    disabled={!dataSourceStructure}
                    error={!!fieldState.error}
                    value={ids.join(', ')}
                    onClick={() => setOpenDataSourceRowsSelectDialog(true)}
                    InputProps={{
                      readOnly: true,
                      className: 'always-show-border',
                      startAdornment: (
                        <InputAdornment position="start">
                          <FormatListBulletedRounded />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <ToggleIconButton
                            disabled={!dataSourceStructure}
                            open={openDataSourceRowsSelectDialog}
                            onToggle={(open) => {
                              setOpenDataSourceRowsSelectDialog(open)
                            }}
                            closedStateIcon={ChecklistRounded}
                            closeTooltip="Select data source rows"
                            openTooltip="Close selection panel"
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
                {dataSourceStructure && (
                  <DataSourceRowsSelectDialog
                    open={openDataSourceRowsSelectDialog}
                    onClose={() => setOpenDataSourceRowsSelectDialog(false)}
                    dataSource={dataSourceStructure}
                    selectedDataSourceIds={ids}
                    onSelectItem={handleItemSelect}
                  />
                )}
              </>
            )
          }}
        />
      )}
      {type === RoutineExecutionType.MATCH_SEQUENTIALLY && (
        <DataSourceFilterForm dataSourceStructure={dataSourceStructure} />
      )}
    </Stack>
  )
}
