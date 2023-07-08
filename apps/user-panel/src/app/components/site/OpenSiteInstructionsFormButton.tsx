import type { IconButtonProps } from '@mui/material'
import { Tooltip, IconButton, SvgIcon } from '@mui/material'
import { ReactComponent as CogsIcon } from '../../components/icons/cogs.svg'

export const OpenSiteInstructionsFormButton = (iconButtonProps: IconButtonProps) => {
  return (
    <Tooltip title="Manage instructions">
      <IconButton size="small" {...iconButtonProps}>
        <SvgIcon component={CogsIcon} inheritViewBox />
      </IconButton>
    </Tooltip>
  )
}
