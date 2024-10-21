import { TextFieldsRounded } from '@mui/icons-material'
import type { SvgIconProps } from '@mui/material'
import { DataSourceColumnType } from '@web-scraper/common'
import { FractionIcon } from '../icons/FractionIcon'
import { NumericIcon } from '../icons/NumericIcon'

interface DataSourceColumnTypeIconProps extends SvgIconProps {
  type: DataSourceColumnType
}

export const DataSourceColumnTypeIcon = ({ type, ...iconProps }: DataSourceColumnTypeIconProps) => {
  switch (type) {
    case DataSourceColumnType.TEXT:
      return <TextFieldsRounded {...iconProps} />
    case DataSourceColumnType.INTEGER:
      return <NumericIcon {...iconProps} />
    case DataSourceColumnType.REAL:
      return <FractionIcon {...iconProps} />
    default:
      return null
  }
}
