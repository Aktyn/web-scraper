import { useMemo } from 'react'
import { Badge, IconButton, SvgIcon, Tooltip, type IconButtonProps } from '@mui/material'
import { type Site } from '@web-scraper/common'
import { ReactComponent as CogsIcon } from '../../components/icons/cogs.svg'
import { ScraperTestingSessionsModule } from '../../modules/ScraperTestingSessionsModule'

export const OpenSiteInstructionsFormButton = (iconButtonProps: IconButtonProps) => {
  return (
    <Tooltip title="Manage site instructions">
      <IconButton size="small" {...iconButtonProps}>
        <SvgIcon component={CogsIcon} inheritViewBox />
      </IconButton>
    </Tooltip>
  )
}

interface OpenSiteInstructionsFormButtonWithBadgeProps {
  site: Site
  onClick: () => void
}

export const OpenSiteInstructionsFormButtonWithBadge = ({
  site,
  onClick,
}: OpenSiteInstructionsFormButtonWithBadgeProps) => {
  const testingSessions = ScraperTestingSessionsModule.useTestingSessions()

  const isSiteSessionActive = useMemo(
    () => testingSessions.sessions.some((session) => session.site.id === site.id),
    [site.id, testingSessions.sessions],
  )

  return (
    <Badge overlap="circular" variant={isSiteSessionActive ? 'dot' : undefined} color="secondary">
      <OpenSiteInstructionsFormButton onClick={onClick} />
    </Badge>
  )
}
