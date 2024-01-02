import { useContext, useState } from 'react'
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
  type DataSourceItem,
  RoutineExecutionType,
  type UpsertRoutineSchema,
} from '@web-scraper/common'
import { Controller, useFormContext } from 'react-hook-form'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { routineExecutionTypeNames } from '../../utils/dictionaries'
import { ToggleIconButton } from '../common/button/ToggleIconButton'
import { DataSourceRowsSelectDialog } from '../dataSource/DataSourceRowsSelectDialog'
import { FormInput } from '../form/FormInput'

export const RoutineExecutionPlanForm = () => {
  const form = useFormContext<UpsertRoutineSchema>()
  const dataSources = useContext(DataSourcesContext)

  const type = form.watch('executionPlan.type')
  const dataSourceName = form.watch('executionPlan.dataSourceName')
  const dataSourceStructure = dataSources.find((dataSource) => dataSource.name === dataSourceName)

  const [openDataSourceRowsSelectDialog, setOpenDataSourceRowsSelectDialog] = useState(false)

  return (
    <Stack gap="1rem">
      <FormInput
        form={form}
        name="executionPlan.type"
        label="Type"
        select
        defaultValue={RoutineExecutionType.STANDALONE}
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
              form={form}
              name="executionPlan.dataSourceName"
              label="Data source"
              select
              disabled={!dataSources.length}
              defaultValue=""
              required
              fullWidth
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
        <>
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
          {/* TODO: filter field */}
        </>
      )}
    </Stack>
  )
}
