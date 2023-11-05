import { useContext, useEffect } from 'react'
import { FormatListBulletedRounded } from '@mui/icons-material'
import {
  Box,
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
  type DataSourceValueQuery,
  type UpsertSiteInstructionsSchema,
  ValueQueryType,
} from '@web-scraper/common'
import { Controller, useFormContext } from 'react-hook-form'
import { DotSeparator } from './DotSeparator'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { DataSourceColumnTypeIcon } from '../dataSource/DataSourceColumnTypeIcon'

interface DataSourceQuerySelectProps {
  fieldName: `actions.${number}.actionSteps.${number}.data`
}

export const DataSourceQuerySelect = ({ fieldName }: DataSourceQuerySelectProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const dataSources = useContext(DataSourcesContext)

  const queryValue = (form.watch(`${fieldName}.dataSourceQuery`) ?? '') as DataSourceValueQuery | ''

  useEffect(() => {
    if (!queryValue.match(new RegExp(`^${ValueQueryType.DATA_SOURCE}\\..*$`, 'u'))) {
      form.setValue(
        `${fieldName}.dataSourceQuery`,
        `${ValueQueryType.DATA_SOURCE}.${
          dataSources.length === 1 ? dataSources[0].name + '.' : ''
        }`,
      )
    }
  }, [dataSources, fieldName, form, queryValue])

  return (
    <Controller
      name={`${fieldName}.dataSourceQuery`}
      control={form.control}
      render={({ field, fieldState }) => {
        const [dataSourceName, dataSourceColumn] = field.value?.split('.').slice(1) ?? ['', '']

        const handleDataSourceNameChange = (name: string) => {
          const dataSource = dataSources.find((dataSource) => dataSource.name === name)
          if (!dataSource) {
            console.error(`Data source ${name} not found`)
            return
          }

          if (dataSource.columns.length === 1) {
            field.onChange(`${ValueQueryType.DATA_SOURCE}.${name}.${dataSource.columns[0].name}`)
          } else {
            field.onChange(`${ValueQueryType.DATA_SOURCE}.${name}`)
          }
        }

        const handleDataSourceColumnChange = (column: string) => {
          field.onChange(`${ValueQueryType.DATA_SOURCE}.${dataSourceName}.${column}`)
        }

        return (
          <FormControl error={!!fieldState.error} sx={{ justifySelf: 'flex-end' }}>
            <InputLabel variant="standard" margin="dense" shrink>
              Data source
            </InputLabel>
            <Stack direction="row" alignItems="stretch" gap="0.5rem">
              <Tooltip title={dataSources.length ? '' : 'There are no data sources defined'}>
                <Stack flexGrow={1} width="50%">
                  <TextField
                    variant="standard"
                    label="Data source"
                    select
                    error={!!fieldState.error}
                    value={dataSourceName ?? ''}
                    onChange={(e) => handleDataSourceNameChange(e.target.value)}
                    onBlur={field.onBlur}
                    disabled={!dataSources.length}
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
                  </TextField>
                </Stack>
              </Tooltip>
              <DotSeparator />
              <TextField
                variant="standard"
                label="Column"
                select
                error={!!fieldState.error}
                disabled={!dataSourceName}
                value={dataSourceColumn ?? ''}
                onChange={(e) => handleDataSourceColumnChange(e.target.value)}
                onBlur={field.onBlur}
                sx={{ flexGrow: 1, width: '50%' }}
              >
                {dataSources
                  .find((dataSource) => dataSource.name === dataSourceName)
                  ?.columns.map((column) => (
                    <MenuItem key={column.name} value={column.name}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-start"
                        columnGap="0.25rem"
                        overflow="hidden"
                      >
                        <DataSourceColumnTypeIcon type={column.type} sx={{ opacity: 0.5 }} />
                        <Box overflow="hidden" textOverflow="ellipsis">
                          {column.name}
                        </Box>
                      </Stack>
                    </MenuItem>
                  )) ?? (
                  <MenuItem value="" disabled>
                    No columns
                  </MenuItem>
                )}
              </TextField>
            </Stack>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )
      }}
    />
  )
}
