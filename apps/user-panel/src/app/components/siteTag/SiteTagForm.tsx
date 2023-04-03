import { useCallback, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { AddRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Divider, IconButton, Stack, Tooltip } from '@mui/material'
import {
  type PaginatedApiFunction,
  type SiteTag,
  upsertSiteTagSchema,
  type UpsertSiteTagSchema,
} from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { useApiRequest } from '../../hooks/useApiRequest'
import { UrlButton } from '../common/button/UrlButton'
import { SearchInput } from '../common/input/SearchInput'
import { FormInput } from '../form/FormInput'
import { Table, type TableRef, useTableColumns } from '../table'
import { BooleanValue } from '../table/BooleanValue'

interface SiteTagFormProps {
  siteTag?: SiteTag | null
  siteUrl?: string
  assignedTagsIds?: SiteTag['id'][]
  onAssign?: (data: SiteTag) => void
  onUpdateSuccess?: () => void
}

export const SiteTagForm = ({
  siteTag,
  siteUrl,
  assignedTagsIds,
  onAssign,
  onUpdateSuccess,
}: SiteTagFormProps) => {
  const tableRef = useRef<TableRef>(null)
  const createSiteTagRequest = useApiRequest(window.electronAPI.createSiteTag)
  const updateSiteTagRequest = useApiRequest(window.electronAPI.updateSiteTag)

  const form = useForm({
    resolver: yupResolver(upsertSiteTagSchema),
    defaultValues: siteTag
      ? {
          name: siteTag.name,
          description: siteTag.description,
        }
      : undefined,
  })

  const [searchValue, setSearchValue] = useState('')

  const name = form.watch('name')
  const siteTagId = siteTag?.id

  const columns = useTableColumns<SiteTag>(
    {
      definitions: [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
        },
        {
          id: 'description',
          header: 'Description',
          accessor: 'description',
        },
        {
          id: 'options',
          header: '',
          accessor: (tag) =>
            assignedTagsIds?.includes(tag.id) ? (
              <BooleanValue value={true} sx={{ justifyContent: 'center' }} />
            ) : (
              <Tooltip title="Assign" disableInteractive>
                <IconButton size="small" onClick={() => onAssign?.(tag)}>
                  <AddRounded />
                </IconButton>
              </Tooltip>
            ),
          cellSx: {
            textAlign: 'center',
            py: 0,
          },
        },
      ],
    },
    [assignedTagsIds],
  )

  const onSubmit = useCallback(
    (data: UpsertSiteTagSchema) => {
      if (siteTagId) {
        updateSiteTagRequest.submit(
          {
            onSuccess: (_, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site tag updated' })
              onUpdateSuccess?.()
            },
          },
          siteTagId,
          { ...data, description: data.description || null },
        )
      } else {
        createSiteTagRequest.submit(
          {
            onSuccess: (tag, { enqueueSnackbar }) => {
              enqueueSnackbar({ variant: 'success', message: 'Site tag created' })
              tableRef.current?.refresh()
              onAssign?.(tag)
            },
          },
          data,
        )
      }
    },
    [createSiteTagRequest, onAssign, onUpdateSuccess, siteTagId, updateSiteTagRequest],
  )

  const searchTagsRequest = useCallback<PaginatedApiFunction<SiteTag, 'id'>>(
    (request) =>
      searchValue
        ? window.electronAPI.getSiteTags({
            ...request,
            filters: [
              ...(request.filters ?? []),
              {
                name: {
                  contains: searchValue,
                },
              },
            ],
          })
        : window.electronAPI.getSiteTags(request),
    [searchValue],
  )

  return (
    <Stack flexGrow={1} justifyContent="space-between" overflow="auto">
      {siteUrl && (
        <>
          <UrlButton width="100%" maxWidth="16rem" justifyContent="center" p={1} mx="auto">
            {siteUrl}
          </UrlButton>
          <Divider />
        </>
      )}
      <Stack
        flexGrow={onAssign ? 0 : 1}
        p={2}
        gap={2}
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormInput name="name" form={form} label="Name" required />
        <FormInput name="description" form={form} label="Description" />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          justifySelf="flex-end"
          mt="auto"
        >
          <LoadingButton
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<AddRounded />}
            disabled={!name}
            size={siteTag ? 'medium' : 'small'}
            loading={createSiteTagRequest.submitting || updateSiteTagRequest.submitting}
            loadingPosition="end"
          >
            {siteTag ? 'Update' : 'Create'}
          </LoadingButton>
        </Stack>
      </Stack>
      {onAssign && (
        <>
          <Divider />
          <Stack flexGrow={1}>
            <Table
              ref={tableRef}
              columns={columns}
              headerContent={
                <SearchInput size="small" value={searchValue} onChange={setSearchValue} />
              }
              keyProperty="id"
              data={searchTagsRequest}
            />
          </Stack>
        </>
      )}
    </Stack>
  )
}
