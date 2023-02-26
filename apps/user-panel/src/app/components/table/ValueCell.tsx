import type { PropsWithChildren } from 'react'
import { TableCell } from '@mui/material'
import type { TableCellProps } from '@mui/material'
import { BooleanValue } from './BooleanValue'
import { NoDataChip } from './NoDataChip'

export const ValueCell = ({ children, ...tableCellProps }: PropsWithChildren<TableCellProps>) => {
  return (
    <TableCell {...tableCellProps}>
      {children === undefined ? (
        '-'
      ) : children === null ? (
        <NoDataChip />
      ) : typeof children === 'boolean' ? (
        <BooleanValue value={children} />
      ) : (
        children
      )}
    </TableCell>
  )
}
