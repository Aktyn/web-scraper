import { useCallback, useRef, useState } from 'react'
import { Box, Chip, Stack, Tooltip } from '@mui/material'
import type { Site } from '@web-scraper/common'
import { SiteForm } from './SiteForm'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { UrlButton } from '../../components/common/button/UrlButton'
import { Table, type TableRef, useTableColumns } from '../../components/table'
import { useApiRequest } from '../../hooks/useApiRequest'

export const Sites = () => {
  const tableRef = useRef<TableRef>(null)
  const siteDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteSiteRequest = useApiRequest(window.electronAPI.deleteSite)
  const columns = useTableColumns<Site>([
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
    },
    {
      id: 'url',
      header: 'URL',
      accessor: (site) => <UrlButton maxWidth="16rem">{site.url}</UrlButton>,
    },
    {
      id: 'language',
      header: 'Language',
      accessor: 'language',
    },
    {
      id: 'tags',
      header: 'Tags',
      cellSx: {
        py: 0,
      },
      accessor: (site) =>
        site.tags.length === 0 ? undefined : (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              maxWidth: '16rem',
              overflowX: 'auto',
              //TODO: button opening popup with list of all tags when their number exceeds certain amount
            }}
          >
            {site.tags.map((tag) => (
              <Tooltip key={tag.id} title={tag.description} disableInteractive>
                <Chip
                  label={tag.name}
                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                  variant="filled"
                  size="small"
                  color="default"
                />
              </Tooltip>
            ))}
          </Stack>
        ),
    },
  ])

  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null)
  const [openSiteDeleteDialog, setOpenSiteDeleteDialog] = useState(false)

  const handleAdd = useCallback(() => {
    setSiteToEdit(null)
    siteDrawerRef.current?.open()
  }, [])
  const finalizeSiteActionSuccess = useCallback(() => {
    siteDrawerRef.current?.close()
    tableRef.current?.refresh()
  }, [])

  const handleDelete = useCallback((site: Site) => {
    setSiteToDelete(site)
    setOpenSiteDeleteDialog(true)
  }, [])
  const handleDeleteConfirm = useCallback(() => {
    if (!siteToDelete) {
      return
    }
    deleteSiteRequest.submit(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
          setOpenSiteDeleteDialog(false)
          tableRef.current?.refresh()
          enqueueSnackbar({ variant: 'success', message: 'Site deleted successfully' })
        },
      },
      siteToDelete.id,
    )
  }, [deleteSiteRequest, siteToDelete])

  const handleEdit = useCallback((site: Site) => {
    setSiteToEdit(site)
    siteDrawerRef.current?.open()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteDrawerRef} title={siteToEdit ? 'Update site' : 'Add site'}>
        <SiteForm site={siteToEdit} onSuccess={finalizeSiteActionSuccess} />
      </CustomDrawer>
      <ConfirmationDialog
        open={openSiteDeleteDialog}
        onClose={() => setOpenSiteDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteSiteRequest.submitting}
        titleContent="Confirm action"
        confirmButtonText="Delete"
      >
        Are you sure you want to delete site with url{' '}
        <UrlButton sx={{ fontWeight: 600 }}>{siteToDelete?.url ?? ''}</UrlButton>&nbsp;?
      </ConfirmationDialog>
      <ViewTransition type={TransitionType.FADE}>
        <Box sx={{ height: '100%' }}>
          <Table
            ref={tableRef}
            columns={columns}
            keyProperty="id"
            data={window.electronAPI.getSites}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </ViewTransition>
    </>
  )
}
