import { SearchRounded } from '@mui/icons-material'
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export const SearchInput = ({
  value,
  onChange,
  ...textFieldProps
}: SearchInputProps & Omit<TextFieldProps, keyof SearchInputProps>) => {
  return (
    <TextField
      variant="outlined"
      placeholder="Search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRounded />
          </InputAdornment>
        ),
        sx: {
          borderRadius: '2rem',
        },
      }}
      {...textFieldProps}
    />
  )
}
