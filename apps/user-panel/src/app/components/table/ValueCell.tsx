import { useContext } from 'react'
import { LockRounded } from '@mui/icons-material'
import { Box, TableCell, type TableCellProps, Tooltip } from '@mui/material'
import { BooleanValue } from './BooleanValue'
import { NoDataChip } from './NoDataChip'
import { UserSettingsContext } from '../../context/userSettingsContext'
import { JsonValue } from '../common/JsonValue'

interface ValueCellProps extends Omit<TableCellProps, 'children'> {
  children: unknown
  encrypted?: boolean
  jsonString?: boolean
}

export const ValueCell = ({
  children,
  encrypted,
  jsonString,
  ...tableCellProps
}: ValueCellProps) => {
  const { dataEncryptionPassword } = useContext(UserSettingsContext)

  return (
    <TableCell {...tableCellProps}>
      <CellContent
        accessDenied={encrypted && dataEncryptionPassword === null}
        jsonString={jsonString}
      >
        {children}
      </CellContent>
    </TableCell>
  )
}

interface CellContentProps {
  children: unknown
  accessDenied?: boolean
  jsonString?: boolean
}

const CellContent = ({ children: value, accessDenied, jsonString }: CellContentProps) => {
  if (accessDenied) {
    return (
      <Tooltip
        title="Press the key icon in the top right corner to unlock this content"
        disableInteractive
      >
        <LockRounded sx={{ color: 'text.secondary' }} />
      </Tooltip>
    )
  }

  if (value === undefined) {
    return <Box component="span">-</Box>
  }

  if (value === null) {
    return <NoDataChip />
  }

  switch (typeof value) {
    case 'boolean':
      return <BooleanValue value={value} />
    case 'object':
      if (value instanceof Date) {
        return <>{value.toLocaleString(navigator.language, dateFormat)}</>
      }
      break
    case 'string':
      if (jsonString) {
        return <JsonValue>{value}</JsonValue>
      }
      break
  }

  return <>{value}</>
}

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
} as const
