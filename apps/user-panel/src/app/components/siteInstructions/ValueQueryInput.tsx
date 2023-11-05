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
  type UpsertSiteInstructionsSchema,
  type ValueQuery,
  ValueQueryType,
} from '@web-scraper/common'
import { Controller, useFormContext } from 'react-hook-form'
import { DotSeparator } from './DotSeparator'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { DataSourceColumnTypeIcon } from '../dataSource/DataSourceColumnTypeIcon'

interface ValueQueryInputProps {
  fieldName: `actions.${number}.actionSteps.${number}.data`
}

export const ValueQueryInput = ({ fieldName }: ValueQueryInputProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const dataSources = useContext(DataSourcesContext)

  const queryValue = (form.watch(`${fieldName}.valueQuery`) ?? '') as ValueQuery | ''

  useEffect(() => {
    if (
      !queryValue.match(
        new RegExp(`^(${ValueQueryType.DATA_SOURCE}|${ValueQueryType.CUSTOM})\\..*$`, 'u'),
      )
    ) {
      form.setValue(`${fieldName}.valueQuery`, `${ValueQueryType.CUSTOM}.`)
    }
  }, [fieldName, form, queryValue])

  return (
    <Controller
      name={`${fieldName}.valueQuery`}
      control={form.control}
      render={({ field, fieldState }) => {
        const queryType =
          (field.value?.replace(
            new RegExp(`^(${ValueQueryType.DATA_SOURCE}|${ValueQueryType.CUSTOM})\\..*$`, 'u'),
            '$1',
          ) as ValueQueryType) ?? ValueQueryType.CUSTOM

        const customValue =
          queryType === ValueQueryType.CUSTOM
            ? field.value?.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), '')
            : ''

        const [dataSourceName, dataSourceColumn] =
          queryType === ValueQueryType.DATA_SOURCE
            ? field.value?.split('.').slice(1) ?? ['', '']
            : ['', '']

        const handleTypeChange = (queryType: ValueQueryType) => {
          switch (queryType) {
            case ValueQueryType.CUSTOM:
              field.onChange(`${queryType}.`)
              break
            case ValueQueryType.DATA_SOURCE:
              if (dataSources.length === 1) {
                handleDataSourceNameChange(dataSources[0].name)
              } else {
                field.onChange(`${queryType}.`)
              }
              break
          }
        }

        const handleCustomValueChange = (value: string) => {
          field.onChange(`${ValueQueryType.CUSTOM}.${value}`)
        }

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
              Value query
            </InputLabel>
            <Stack direction="row" alignItems="stretch" gap="0.5rem">
              <TextField
                variant="standard"
                label=" "
                select
                error={!!fieldState.error}
                value={queryType ?? ''}
                onChange={(e) => handleTypeChange(e.target.value as ValueQueryType)}
                onBlur={field.onBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListBulletedRounded />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value={ValueQueryType.DATA_SOURCE}>Data source</MenuItem>
                <MenuItem value={ValueQueryType.CUSTOM}>Custom</MenuItem>
              </TextField>
              <DotSeparator />
              {queryValue.startsWith(ValueQueryType.CUSTOM) && (
                <TextField
                  variant="standard"
                  label=" "
                  error={!!fieldState.error}
                  value={customValue ?? ''}
                  onChange={(e) => handleCustomValueChange(e.target.value)}
                  onBlur={field.onBlur}
                  sx={{ flexGrow: 1 }}
                />
              )}
              {queryValue.startsWith(ValueQueryType.DATA_SOURCE) && (
                <>
                  <Tooltip title={dataSources.length ? '' : 'There are no data sources defined'}>
                    <Stack flexGrow={1} maxWidth="8rem">
                      <TextField
                        variant="standard"
                        label="Data source"
                        select
                        error={!!fieldState.error}
                        value={dataSourceName ?? ''}
                        onChange={(e) => handleDataSourceNameChange(e.target.value)}
                        onBlur={field.onBlur}
                        disabled={!dataSources.length}
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
                    sx={{ flexGrow: 1, maxWidth: '8rem' }}
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
                </>
              )}
            </Stack>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )
      }}
    />
  )
}
