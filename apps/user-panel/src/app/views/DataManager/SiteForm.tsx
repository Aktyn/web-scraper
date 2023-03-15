import { useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { SendRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { createSiteSchema, type CreateSiteSchema } from '@web-scrapper/common'
import { useForm } from 'react-hook-form'
import { UrlPreview } from '../../components/common/UrlPreview'
import { FormInput } from '../../components/form/FormInput'
import { useApiRequest } from '../../hooks/useApiRequest'

export const SiteForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const createSiteRequest = useApiRequest(window.electronAPI.createSite)

  const form = useForm<CreateSiteSchema>({
    mode: 'onTouched',
    resolver: yupResolver(createSiteSchema),
  })

  const url = form.watch('url')

  const onSubmit = useCallback(
    (data: CreateSiteSchema) => {
      createSiteRequest.submit(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'success', message: 'Site created' })
            onSuccess()
          },
        },
        data,
      )
    },
    [createSiteRequest, onSuccess],
  )

  return (
    <Stack
      flexGrow={1}
      component="form"
      justifyContent="space-between"
      p={2}
      spacing={2}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Stack spacing={2}>
        <FormInput name="url" form={form} label="URL" required />
        <FormInput name="language" form={form} label="Language" />
      </Stack>
      <UrlPreview url={form.watch('url')} width={256} maxHeight={414} />
      <Stack direction="row" alignItems="center" justifyContent="center">
        <LoadingButton
          variant="outlined"
          color="primary"
          type="submit"
          endIcon={<SendRounded />}
          disabled={!url}
          loading={createSiteRequest.submitting}
          loadingPosition="end"
        >
          Submit
        </LoadingButton>
      </Stack>
    </Stack>
  )
}
