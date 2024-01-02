import { Fragment } from 'react'
import {
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material'
import { type Procedure, type SiteProcedures } from '@web-scraper/common'
import { UrlButton } from '../common/button/UrlButton'

interface ProcedureSelectListProps {
  siteProcedures: SiteProcedures[]
  selectedProcedures: Procedure['id'][]
  onToggle: (procedure: Procedure, checked: boolean) => void
}

export const ProcedureSelectList = ({
  siteProcedures,
  selectedProcedures,
  onToggle,
}: ProcedureSelectListProps) => {
  if (!siteProcedures.length) {
    return (
      <Typography variant="body1" fontWeight="bold" p="1rem">
        No procedures found
      </Typography>
    )
  }

  return (
    <List disablePadding sx={{ pt: '0.5rem' }}>
      {siteProcedures.map(({ site, procedures }, index) => (
        <Fragment key={site.id}>
          {index > 0 && <Divider sx={{ my: '0.5rem' }} />}
          <ListSubheader disableSticky sx={{ backgroundColor: 'transparent' }}>
            <Typography variant="body1" fontWeight="bold" py="0.5rem">
              <UrlButton readOnly>{site.url}</UrlButton>
            </Typography>
          </ListSubheader>
          {procedures.map((procedure) => {
            const labelId = `checkbox-list-procedure-${procedure.id}`
            const checked = selectedProcedures.includes(procedure.id)

            return (
              <ListItem key={procedure.id} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => onToggle(procedure, !checked)}
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    <Checkbox
                      edge="start"
                      checked={checked}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={procedure.name} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </Fragment>
      ))}
    </List>
  )
}
