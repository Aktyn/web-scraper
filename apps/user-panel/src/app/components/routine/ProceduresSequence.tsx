import { Fragment } from 'react'
import {
  DeleteRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  SouthRounded,
} from '@mui/icons-material'
import { Box, Button, ButtonGroup, Fade, IconButton, Stack, Typography, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import { type Procedure, type Site } from '@web-scraper/common'

interface ProceduresSequenceProps {
  selectedProceduresList?: { site: Site; procedure: Procedure }[]
  onRemove: (procedure: Procedure) => void
  onSwap: (fromIndex: number, toIndex: number) => void
}

export const ProceduresSequence = ({
  selectedProceduresList,
  onRemove,
  onSwap,
}: ProceduresSequenceProps) => {
  return (
    <Stack alignItems="center" gap="0.5rem">
      {selectedProceduresList?.length ? (
        <Stack alignItems="stretch" rowGap="0.25rem" color="text.secondary">
          {selectedProceduresList.map(({ site, procedure }, index) => (
            <Fragment key={procedure.id}>
              {index > 0 && (
                <Fade in>
                  <SouthRounded color="inherit" sx={{ alignSelf: 'center' }} />
                </Fade>
              )}
              <Fade in>
                <Box
                  pr="0.5rem"
                  border={(theme) => `1px solid ${theme.palette.divider}`}
                  borderRadius="0.5rem"
                  bgcolor={alpha(common.white, 0.025)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    columnGap: '0.5rem',
                  }}
                >
                  <Stack justifySelf="flex-start" justifyContent="center">
                    <ButtonGroup orientation="vertical" variant="text" size="small" color="inherit">
                      <Button
                        key={`up-${index}`}
                        disabled={index === 0}
                        onClick={() => onSwap(index, index - 1)}
                        sx={{ borderRadius: '0.25rem' }}
                      >
                        <KeyboardArrowUpRounded />
                      </Button>
                      <Button
                        key={`down-${index}`}
                        disabled={index === selectedProceduresList.length - 1}
                        onClick={() => onSwap(index, index + 1)}
                        sx={{ borderRadius: '0.25rem' }}
                      >
                        <KeyboardArrowDownRounded />
                      </Button>
                    </ButtonGroup>
                  </Stack>
                  <Stack alignItems="center" rowGap="0.25rem">
                    <Typography variant="body2" color="text.primary" fontWeight="bold">
                      {procedure.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {site.url}
                    </Typography>
                  </Stack>
                  <IconButton onClick={() => onRemove(procedure)} sx={{ justifySelf: 'flex-end' }}>
                    <DeleteRounded fontSize="inherit" />
                  </IconButton>
                </Box>
              </Fade>
            </Fragment>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No procedures selected
        </Typography>
      )}
    </Stack>
  )
}
