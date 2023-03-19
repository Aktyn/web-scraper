import { useCallback, useRef, useState } from 'react'
import { VisibilityRounded } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import type { Account, Site } from '@web-scrapper/common'
import { SiteForm } from './SiteForm'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { CopyableLabel } from '../../components/common/CopyableLabel'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { Table, useTableColumns } from '../../components/table'
import { useEncryptedApiRequest } from '../../components/table/useEncryptedApiRequest'
import { useApiRequest } from '../../hooks/useApiRequest'

export const Accounts = () => {
  const siteDrawerRef = useRef<CustomDrawerRef>(null)
  const getSiteRequest = useApiRequest(window.electronAPI.getSite)

  const [showSite, setShowSite] = useState<Site | null>(null)

  const handleShowSite = useCallback(
    (siteId: Site['id']) => {
      getSiteRequest.submit(
        {
          onSuccess: (site) => {
            setShowSite(site)
            siteDrawerRef.current?.open()
          },
        },
        siteId,
      )
    },
    [getSiteRequest],
  )

  const columns = useTableColumns<Account>([
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
      id: 'loginOrEmail',
      header: 'Login or email',
      accessor: (row) => <CopyableLabel>{row.loginOrEmail}</CopyableLabel>,
      encrypted: true,
    },
    {
      id: 'password',
      header: 'Password',
      accessor: (row) => <CopyableLabel>{row.password}</CopyableLabel>,
      encrypted: true,
    },
    {
      id: 'additionalCredentialsData',
      header: 'Additional credentials data',
      accessor: 'additionalCredentialsData',
      encrypted: true,
      jsonString: true,
    },
    {
      id: 'lastUsed',
      header: 'Last used',
      accessor: 'lastUsed',
    },
    {
      id: 'active',
      header: 'Active',
      accessor: 'active',
    },
    {
      id: 'siteId',
      header: 'Site',
      accessor: (account) => (
        <Tooltip title="Show details" disableInteractive>
          <IconButton size="small" onClick={() => handleShowSite(account.siteId)}>
            <VisibilityRounded />
          </IconButton>
        </Tooltip>
      ),
      cellSx: {
        py: 0,
      },
    },
  ])

  const getAccountsRequest = useEncryptedApiRequest(window.electronAPI.getAccounts)

  const finalizeSiteActionSuccess = useCallback(() => {
    siteDrawerRef.current?.close()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteDrawerRef} title="Site details">
        <SiteForm site={showSite} onSuccess={finalizeSiteActionSuccess} />
      </CustomDrawer>
      <ViewTransition type={TransitionType.FADE}>
        <Box sx={{ height: '100%' }}>
          <Table columns={columns} keyProperty="id" data={getAccountsRequest} />
        </Box>
      </ViewTransition>
    </>
  )
}
