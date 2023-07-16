import { useCallback, type ReactNode } from 'react'
import {
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  listClasses,
  type FormControlProps,
  type SelectChangeEvent,
  type ChipProps,
} from '@mui/material'
import { HorizontallyScrollableContainer } from '../HorizontallyScrollableContainer'

export type OptionSchema<ValueType extends string | number> = {
  value: ValueType
  label: ReactNode
  chipProps?: Omit<ChipProps, 'label'>
}

interface MultiSelectProps<ValueType extends string | number>
  extends Omit<FormControlProps, 'onChange'> {
  options: OptionSchema<ValueType>[]
  selectedValues: ValueType[]
  onChange: (selectedValues: ValueType[]) => void
}

export const MultiSelect = <ValueType extends string | number>({
  options,
  selectedValues,
  onChange,
  ...formControlProps
}: MultiSelectProps<ValueType>) => {
  const handleChange = useCallback(
    (event: SelectChangeEvent<ValueType[]>) => {
      const value = event.target.value
      onChange(typeof value === 'string' ? (value.split(',') as ValueType[]) : value)
    },
    [onChange],
  )

  return (
    <FormControl {...formControlProps}>
      <InputLabel shrink>Types</InputLabel>
      <Select
        size="small"
        variant="outlined"
        multiple
        value={selectedValues}
        onChange={handleChange}
        input={<OutlinedInput label="Types" notched />}
        displayEmpty
        renderValue={(selectedValues) => (
          <HorizontallyScrollableContainer
            alignItems="center"
            gap={0.5}
            sx={{ borderRadius: '1rem' }}
          >
            {selectedValues.length ? (
              selectedValues.map((value) => {
                const selectedOption = options.find((opt) => opt.value === value)

                return (
                  <Chip
                    key={value}
                    label={selectedOption?.label ?? value}
                    {...selectedOption?.chipProps}
                  />
                )
              })
            ) : (
              <Chip label="Any type" />
            )}
          </HorizontallyScrollableContainer>
        )}
        sx={{ minHeight: '3.5rem', minWidth: '6rem', mt: '0 !important', borderRadius: '3.5rem' }}
        MenuProps={{
          PaperProps: {
            sx: {
              [`& > .${listClasses.padding}`]: {
                py: 0,
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ px: '0.25rem' }}>
            <Checkbox checked={selectedValues.indexOf(option.value) !== -1} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
