import { useCallback, useRef, useState } from 'react'
import { Box, IconButton, type IconButtonProps, SvgIcon, Tooltip } from '@mui/material'
import type { Site } from '@web-scraper/common'
import { SiteForm } from './SiteForm'
import { SiteInstructionsForm } from './SiteInstructionsForm'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { UrlButton } from '../../components/common/button/UrlButton'
import { ReactComponent as CogsIcon } from '../../components/icons/cogs.svg'
import { Table, type TableRef, useTableColumns } from '../../components/table'
import { TagsCellValue } from '../../components/table/TagsCellValue'
import { useApiRequest } from '../../hooks/useApiRequest'

export const Sites = () => {
  const tableRef = useRef<TableRef>(null)
  const siteDrawerRef = useRef<CustomDrawerRef>(null)
  const siteInstructionsDrawerRef = useRef<CustomDrawerRef>(null)

  const deleteSiteRequest = useApiRequest(window.electronAPI.deleteSite)
  const columns = useTableColumns<Site>(
    {
      definitions: [
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
          accessor: (site) => <TagsCellValue tags={site.tags} />,
        },
      ],
      customActions: [
        {
          id: 'instructions',
          accessor: (site) => (
            <OpenSiteInstructionsFormButton onClick={() => handleShowInstructions(site)} />
          ),
        },
      ],
    },
    [],
  )

  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null)
  const [siteToShowInstructions, setSiteToShowInstructions] = useState<Site | null>(null)
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

  const handleShowInstructions = useCallback((site: Site) => {
    setSiteToShowInstructions(site)
    siteInstructionsDrawerRef.current?.open()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteDrawerRef} title={siteToEdit ? 'Update site' : 'Add site'}>
        <SiteForm site={siteToEdit} onSuccess={finalizeSiteActionSuccess} />
      </CustomDrawer>
      <CustomDrawer ref={siteInstructionsDrawerRef} title="Site instructions">
        <SiteInstructionsForm site={siteToShowInstructions} />
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

const OpenSiteInstructionsFormButton = (iconButtonProps: IconButtonProps) => {
  return (
    <Tooltip title="Manage instructions" disableInteractive>
      <IconButton size="small" {...iconButtonProps}>
        <SvgIcon component={CogsIcon} inheritViewBox />
      </IconButton>
    </Tooltip>
  )
}
