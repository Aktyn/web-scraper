import { useContext, useMemo } from 'react'
import { LockRounded } from '@mui/icons-material'
import { Box, TableCell, type TableCellProps, Tooltip } from '@mui/material'
import { BooleanValue } from './BooleanValue'
import { NoDataChip } from './NoDataChip'
import { UserDataContext } from '../../context/userDataContext'
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
  const { dataEncryptionPassword } = useContext(UserDataContext)
  const accessDenied = encrypted && dataEncryptionPassword === null

  const tableCellSx = useMemo((): TableCellProps['sx'] => {
    if (children === null || accessDenied || typeof children === 'boolean' || jsonString) {
      return {
        py: 0,
      }
    }

    return {}
  }, [accessDenied, children, jsonString])

  return (
    <TableCell
      {...tableCellProps}
      sx={
        {
          ...tableCellSx,
          ...(tableCellProps.sx ?? {}),
        } as TableCellProps['sx']
      }
    >
      <CellContent accessDenied={accessDenied} jsonString={jsonString}>
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
