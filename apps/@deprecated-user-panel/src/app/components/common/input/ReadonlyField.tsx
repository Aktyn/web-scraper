import type { ReactNode } from 'react'
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material'

type ReadonlyFieldProps = Omit<TextFieldProps, 'onChange'> & {
  icon?: ReactNode
  showBorder?: boolean
}

export const ReadonlyField = ({ icon, showBorder, ...props }: ReadonlyFieldProps) => (
  <TextField
    variant="standard"
    {...props}
    InputProps={{
      readOnly: true,
      className: showBorder ? 'always-show-border' : undefined,
      startAdornment: icon && <InputAdornment position="start">{icon}</InputAdornment>,
      ...props.InputProps,
    }}
  />
)
