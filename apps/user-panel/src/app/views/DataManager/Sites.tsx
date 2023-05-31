import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Badge, Box } from '@mui/material'
import type { Site } from '@web-scraper/common'
import { TermInfo } from 'src/app/components/common/TermInfo'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { UrlButton } from '../../components/common/button/UrlButton'
import { OpenSiteInstructionsFormButton } from '../../components/site/OpenSiteInstructionsFormButton'
import { SiteForm } from '../../components/site/SiteForm'
import { SiteInstructionsForm } from '../../components/siteInstructions/SiteInstructionsForm'
import { Table, useTableColumns, type TableRef } from '../../components/table'
import { TagsCellValue } from '../../components/table/TagsCellValue'
import { ApiContext } from '../../context/apiContext'
import { useApiRequest } from '../../hooks/useApiRequest'

export const Sites = () => {
  const tableRef = useRef<TableRef>(null)
  const siteDrawerRef = useRef<CustomDrawerRef>(null)
  const siteInstructionsDrawerRef = useRef<CustomDrawerRef>(null)

  const { submit: deleteSiteRequest, submitting: deletingSiteRequest } = useApiRequest(
    window.electronAPI.deleteSite,
  )
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
            <OpenSiteInstructionsFormButtonWithBadge
              site={site}
              onClick={() => handleShowInstructions(site)}
            />
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
    deleteSiteRequest(
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
  const handleSiteInstructionsSet = useCallback(() => {
    setSiteToShowInstructions(null)
    siteInstructionsDrawerRef.current?.close()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteDrawerRef} title={siteToEdit ? 'Update site' : 'Add site'}>
        <SiteForm site={siteToEdit} onSuccess={finalizeSiteActionSuccess} />
      </CustomDrawer>
      <CustomDrawer
        ref={siteInstructionsDrawerRef}
        title={
          <>
            <Box component="span" mr={1}>
              Site instructions
            </Box>
            <TermInfo term="Site instructions" />
          </>
        }
      >
        {siteToShowInstructions && (
          <SiteInstructionsForm
            site={siteToShowInstructions}
            onSuccess={handleSiteInstructionsSet}
          />
        )}
      </CustomDrawer>
      <ConfirmationDialog
        open={openSiteDeleteDialog}
        onClose={() => setOpenSiteDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        loading={deletingSiteRequest}
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

interface OpenSiteInstructionsFormButtonWithBadgeProps {
  site: Site
  onClick: () => void
}

const OpenSiteInstructionsFormButtonWithBadge = ({
  site,
  onClick,
}: OpenSiteInstructionsFormButtonWithBadgeProps) => {
  const { testingSessions } = useContext(ApiContext)

  const isSiteSessionActive = useMemo(
    () => testingSessions.sessions.some((session) => session.site.id === site.id),
    [site.id, testingSessions.sessions],
  )

  return (
    <Badge overlap="circular" variant={isSiteSessionActive ? 'dot' : undefined} color="secondary">
      <OpenSiteInstructionsFormButton onClick={onClick} />
    </Badge>
  )
}
