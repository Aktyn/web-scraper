import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { EventRounded, LinkRounded, SendRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
} from '@mui/material'
import {
  ErrorCode,
  upsertSiteInstructionsSchema,
  type Site,
  type SiteInstructions,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { ActionsForm } from './ActionsForm'
import { ProceduresForm } from './ProceduresForm'
import { useApiRequest } from '../../hooks/useApiRequest'
import { errorHelpers, formatDate } from '../../utils'
import { UrlButton } from '../common/button/UrlButton'

interface SiteInstructionsFormProps {
  site?: Site | null
}

export const SiteInstructionsForm = ({ site }: SiteInstructionsFormProps) => {
  const getSiteInstructions = useApiRequest(window.electronAPI.getSiteInstructions)

  const form = useForm<UpsertSiteInstructionsSchema>({
    mode: 'onTouched',
    resolver: yupResolver(upsertSiteInstructionsSchema),
  })

  const [instructions, setInstructions] = useState<SiteInstructions | null>(null)

  useEffect(() => {
    if (!site) {
      return
    }
    getSiteInstructions.submit(
      {
        onSuccess: (instructions) => {
          form.reset(instructions)
          setInstructions(instructions)
        },
        onError: (error, { enqueueSnackbar }) => {
          if (error.errorCode === ErrorCode.NOT_FOUND) {
            setInstructions(null)
            form.reset()
          } else {
            enqueueSnackbar({ variant: 'error', message: errorHelpers[error.errorCode] })
          }
        },
      },
      site.id,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site])

  if (!site) {
    return null
  }

  return (
    <Stack flexGrow={1} overflow="auto" minWidth="32rem">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: instructions ? '1fr 1fr' : 'auto',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          py: 1,
        }}
      >
        <FormControl sx={{ justifySelf: 'flex-end' }}>
          <InputLabel variant="standard" margin="dense" shrink>
            Url
          </InputLabel>
          <Stack direction="row" alignItems="center" spacing={1} mt="1rem" minHeight="2rem">
            <LinkRounded />
            <UrlButton width="100%" maxWidth="16rem" justifyContent="flex-start">
              {site.url}
            </UrlButton>
          </Stack>
        </FormControl>
        {instructions && (
          <TextField
            label="Created"
            value={formatDate(instructions.createdAt)}
            variant="standard"
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <EventRounded />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>
      <Divider />
      <Stack flexGrow={1} alignItems="center" py={2}>
        {getSiteInstructions.submitting ? (
          <CircularProgress color="primary" size="2rem" />
        ) : (
          instructions && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                justifyContent: 'center',
                alignItems: 'stretch',
                gap: 2,
              }}
            >
              <ProceduresForm form={form} />
              <ActionsForm form={form} />
            </Box>
          )
        )}
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="center" pb={2}>
        <LoadingButton
          variant="outlined"
          color="primary"
          type="submit"
          endIcon={<SendRounded />}
          // disabled={!url} //TODO
          // loading={createSiteRequest.submitting || updateSiteRequest.submitting} //TODO
          loadingPosition="end"
        >
          Apply
        </LoadingButton>
      </Stack>
    </Stack>
  )
}
