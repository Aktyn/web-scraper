import { useCallback, useRef, useState } from 'react'
import { DeleteSweepRounded } from '@mui/icons-material'
import { Box, Tooltip } from '@mui/material'
import type { SiteTag } from '@web-scraper/common'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { ConfirmableButton } from '../../components/common/button/ConfirmableButton'
import { SiteTagForm } from '../../components/siteTag/SiteTagForm'
import { Table, type TableRef, useTableColumns } from '../../components/table'
import { useApiRequest } from '../../hooks/useApiRequest'

export const SiteTags = () => {
  const tableRef = useRef<TableRef>(null)
  const siteTagDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteSiteTagRequest = useApiRequest(window.electronAPI.deleteSiteTag)
  const deleteLooseTagsRequest = useApiRequest(window.electronAPI.deleteLooseSiteTags)
  const columns = useTableColumns<SiteTag>({
    definitions: [
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
    ],
  })

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

  const handleRemoveLooseTags = useCallback(() => {
    deleteLooseTagsRequest.submit({
      onSuccess: (res, { enqueueSnackbar }) => {
        if (res.deletedCount > 0) {
          tableRef.current?.refresh()
        }
        enqueueSnackbar({
          variant: res.deletedCount ? 'success' : 'info',
          message: res.deletedCount
            ? `Removed ${res.deletedCount} loose tags`
            : 'There are no loose tags to remove',
        })
      },
    })
  }, [deleteLooseTagsRequest])

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
            name="site-tags"
            ref={tableRef}
            columns={columns}
            headerContent={
              <Tooltip title="Remove all tags that are not assigned to any site">
                <Box>
                  <ConfirmableButton
                    variant="outlined"
                    color="primary"
                    size="small"
                    endIcon={<DeleteSweepRounded />}
                    onConfirm={handleRemoveLooseTags}
                  >
                    Remove loose tags
                  </ConfirmableButton>
                </Box>
              </Tooltip>
            }
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
