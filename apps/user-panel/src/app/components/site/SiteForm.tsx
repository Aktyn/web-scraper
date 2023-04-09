import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  AddRounded,
  EventRounded,
  LanguageRounded,
  LinkRounded,
  SendRounded,
} from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { type Site, upsertSiteSchema, type UpsertSiteSchema } from '@web-scraper/common'
import anime from 'animejs'
import { useFieldArray, useForm } from 'react-hook-form'
import { useApiRequest } from '../../hooks/useApiRequest'
import { formatDate } from '../../utils'
import { SiteAccounts } from '../account/SiteAccounts'
import { NestedDrawer } from '../common/NestedDrawer'
import { UrlPreview } from '../common/UrlPreview'
import { DrawerToggle } from '../common/button/DrawerToggle'
import { FormInput } from '../form/FormInput'
import { SiteTagForm } from '../siteTag/SiteTagForm'

interface SiteFormProps {
  site?: Site | null
  onSuccess: () => void
}

export const SiteForm = ({ site, onSuccess }: SiteFormProps) => {
  const addIconRef = useRef<SVGSVGElement>(null)

  const createSiteRequest = useApiRequest(window.electronAPI.createSite)
  const updateSiteRequest = useApiRequest(window.electronAPI.updateSite)

  const form = useForm({
    mode: 'onTouched',
    resolver: yupResolver(upsertSiteSchema),
    defaultValues: site
      ? {
          url: site.url,
          language: site.language,
          siteTags: site.tags,
        }
      : undefined,
  })
  const siteTagsFields = useFieldArray({
    control: form.control,
    name: 'siteTags',
    keyName: 'fieldKey',
  })

  const [showSiteAccounts, setShowSiteAccounts] = useState(false)
  const [openSiteTagForm, setOpenSiteTagForm] = useState(false)

  const url = form.watch('url')
  const siteId = site?.id

  const onSubmit = useCallback(
    (data: UpsertSiteSchema) => {
      if (siteId) {
        updateSiteRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site updated' })
              onSuccess()
            },
          },
          siteId,
          { ...data, language: data.language || null },
        )
      } else {
        createSiteRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site created' })
              onSuccess()
            },
          },
          data,
        )
      }
    },
    [createSiteRequest, updateSiteRequest, onSuccess, siteId],
  )

  useEffect(() => {
    anime({
      targets: addIconRef.current,
      rotate: openSiteTagForm ? -45 : 0,
      easing: 'spring(0.7, 100, 10, 0)',
    })
  }, [openSiteTagForm])

  const tagsIds = useMemo(
    () => siteTagsFields.fields.map((field) => field.id),
    [siteTagsFields.fields],
  )

  return (
    <>
      <NestedDrawer
        title="Assign tags to site"
        onClose={() => setOpenSiteTagForm(false)}
        open={openSiteTagForm}
      >
        <SiteTagForm
          siteUrl={url}
          assignedTagsIds={tagsIds}
          onAssign={(tag) => siteTagsFields.append(tag)}
        />
      </NestedDrawer>
      {site && (
        <NestedDrawer
          title="Site accounts"
          onClose={() => setShowSiteAccounts(false)}
          open={showSiteAccounts}
        >
          <SiteAccounts site={site} />
        </NestedDrawer>
      )}
      <Stack
        flexGrow={1}
        justifyContent="space-between"
        p={2}
        spacing={2}
        overflow="auto"
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Stack spacing={2}>
          {site && (
            <TextField
              label="Created"
              value={formatDate(site.createdAt)}
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
          <FormInput
            name="url"
            form={form}
            label="URL"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkRounded />
                </InputAdornment>
              ),
            }}
          />
          <FormInput
            name="language"
            form={form}
            label="Language"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageRounded />
                </InputAdornment>
              ),
            }}
          />
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            {siteTagsFields.fields.length ? (
              siteTagsFields.fields.map((field, index) => (
                <Tooltip key={field.fieldKey} title={field.description} disableInteractive>
                  <Chip
                    label={field.name}
                    sx={{ fontWeight: 'bold', color: 'text.primary' }}
                    variant="filled"
                    size="small"
                    color="default"
                    onDelete={() => siteTagsFields.remove(index)}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                No tags
              </Typography>
            )}
            <Tooltip title="Assign existing tag or create new one" disableInteractive>
              <IconButton
                size="small"
                onClick={() => {
                  setOpenSiteTagForm((open) => !open)
                }}
              >
                <AddRounded ref={addIconRef} />
              </IconButton>
            </Tooltip>
          </Stack>
          {site && (
            <DrawerToggle open={showSiteAccounts} onToggle={setShowSiteAccounts}>
              Preview accounts
            </DrawerToggle>
          )}
        </Stack>
        <UrlPreview url={form.watch('url')} width={256} maxHeight={414} />
        <Stack direction="row" alignItems="center" justifyContent="center">
          <LoadingButton
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<SendRounded />}
            disabled={!url}
            loading={createSiteRequest.submitting || updateSiteRequest.submitting}
            loadingPosition="end"
          >
            {site ? 'Update' : 'Submit'}
          </LoadingButton>
        </Stack>
      </Stack>
    </>
  )
}