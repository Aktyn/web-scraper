import { useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
import type { SiteTag } from '@web-scrapper/common'
import { SiteTagForm } from './SiteTagForm'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { Table, type TableRef, useTableColumns } from '../../components/table'
import { useApiRequest } from '../../hooks/useApiRequest'

export const SiteTags = () => {
  const tableRef = useRef<TableRef>(null)
  const siteTagDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteSiteTagRequest = useApiRequest(window.electronAPI.deleteSiteTag)
  const columns = useTableColumns<SiteTag>([
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
    },
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
  ])

  const [siteTagToDelete, setSiteTagToDelete] = useState<SiteTag | null>(null)
  const [siteTagToEdit, setSiteTagToEdit] = useState<SiteTag | null>(null)
  const [openSiteTagDeleteDialog, setOpenSiteTagDeleteDialog] = useState(false)

  const finalizeSiteTagUpdateSuccess = useCallback(() => {
    siteTagDrawerRef.current?.close()
    tableRef.current?.refresh()
  }, [])

  const handleDelete = useCallback((tag: SiteTag) => {
    setSiteTagToDelete(tag)
    setOpenSiteTagDeleteDialog(true)
  }, [])
  const handleDeleteConfirm = useCallback(() => {
    if (!siteTagToDelete) {
      return
    }
    deleteSiteTagRequest.submit(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
          setOpenSiteTagDeleteDialog(false)
          tableRef.current?.refresh()
          enqueueSnackbar({ variant: 'success', message: 'Site deleted successfully' })
        },
      },
      siteTagToDelete.id,
    )
  }, [deleteSiteTagRequest, siteTagToDelete])

  const handleEdit = useCallback((tag: SiteTag) => {
    setSiteTagToEdit(tag)
    siteTagDrawerRef.current?.open()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteTagDrawerRef} title="Update site tag">
        <SiteTagForm siteTag={siteTagToEdit} onUpdateSuccess={finalizeSiteTagUpdateSuccess} />
      </CustomDrawer>
      <ConfirmationDialog
        open={openSiteTagDeleteDialog}
        onClose={() => setOpenSiteTagDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteSiteTagRequest.submitting}
        titleContent="Confirm action"
        confirmButtonText="Delete"
      >
        Are you sure you want to delete site tag with name {siteTagToDelete?.name ?? ''}?
      </ConfirmationDialog>
      <ViewTransition type={TransitionType.FADE}>
        <Box sx={{ height: '100%' }}>
          <Table
            ref={tableRef}
            columns={columns}
            keyProperty="id"
            data={window.electronAPI.getSiteTags}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </ViewTransition>
    </>
  )
}
