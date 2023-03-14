import { useCallback } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { SendRounded } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'
import { useForm } from 'react-hook-form'
import type * as yup from 'yup'
import { siteFormSchema } from './siteFormSchema'
import { UrlPreview } from '../../components/common/UrlPreview'
import { FormInput } from '../../components/form/FormInput'

type SiteFormType = yup.InferType<typeof siteFormSchema>

export const SiteForm = () => {
  // const createSiteRequest = useApiRequest(window.electronAPI.setUserSetting)

  const form = useForm<SiteFormType>({
    mode: 'onTouched',
    resolver: yupResolver(siteFormSchema),
  })

  const url = form.watch('url')

  const onSubmit = useCallback((_data: SiteFormType) => {
    //TODO: submit request to API
  }, [])

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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          endIcon={<SendRounded />}
          disabled={!url}
        >
          Submit
        </Button>
      </Stack>
    </Stack>
  )
}
