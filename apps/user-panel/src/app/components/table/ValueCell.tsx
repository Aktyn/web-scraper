import type { PropsWithChildren } from 'react'
import { useContext } from 'react'
import { LockRounded } from '@mui/icons-material'
import { TableCell, Tooltip, type TableCellProps } from '@mui/material'
import { BooleanValue } from './BooleanValue'
import { NoDataChip } from './NoDataChip'
import { UserSettingsContext } from '../../context/userSettingsContext'

interface ValueCellProps extends TableCellProps {
  encrypted?: boolean
}

export const ValueCell = ({
  children,
  encrypted,
  ...tableCellProps
}: PropsWithChildren<ValueCellProps>) => {
  const { dataEncryptionPassword } = useContext(UserSettingsContext)

  const accessDenied = children === '' && encrypted && dataEncryptionPassword === null

  return (
    <TableCell {...tableCellProps}>
      {children === undefined ? (
        '-'
      ) : children === null ? (
        <NoDataChip />
      ) : typeof children === 'boolean' ? (
        <BooleanValue value={children} />
      ) : accessDenied ? (
        <Tooltip
          title="Press the key icon in the top right corner to unlock this content"
          disableInteractive
        >
          <LockRounded sx={{ color: 'text.secondary' }} />
        </Tooltip>
      ) : (
        children
      )}
    </TableCell>
  )
}
