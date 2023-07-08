import { useCallback, useRef, useState } from 'react'
import { AddRounded, VisibilityRounded } from '@mui/icons-material'
import { Box, Tooltip } from '@mui/material'
import type { Account, Site } from '@web-scraper/common'
import { AccountForm } from '../../components/account/AccountForm'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import { CopyableLabel } from '../../components/common/CopyableLabel'
import type { CustomDrawerRef } from '../../components/common/CustomDrawer'
import { CustomDrawer } from '../../components/common/CustomDrawer'
import { EncryptedContentIconButton } from '../../components/common/button/EncryptedContentIconButton'
import { LoadingIconButton } from '../../components/common/button/LoadingIconButton'
import { SiteForm } from '../../components/site/SiteForm'
import type { TableRef } from '../../components/table'
import { Table, useTableColumns } from '../../components/table'
import { useEncryptedApiRequest } from '../../components/table/useEncryptedApiRequest'
import { useApiRequest } from '../../hooks/useApiRequest'

export const Accounts = () => {
  const tableRef = useRef<TableRef>(null)
  const siteDrawerRef = useRef<CustomDrawerRef>(null)
  const accountDrawerRef = useRef<CustomDrawerRef>(null)

  const { submit: getSiteRequest, submitting: gettingSiteRequest } = useApiRequest(
    window.electronAPI.getSite,
  )
  const getAccountsEncryptedRequest = useEncryptedApiRequest(window.electronAPI.getAccounts)
  const { submit: deleteAccountRequest, submitting: deletingAccountRequest } = useApiRequest(
    window.electronAPI.deleteAccount,
  )

  const [showSite, setShowSite] = useState<Site | null>(null)
  const [openSiteForAccountId, setOpenSiteForAccountId] = useState<Site['id'] | null>(null)

  const handleShowSite = useCallback(
    (siteId: Site['id']) => {
      getSiteRequest(
        {
          onSuccess: (site) => {
            setShowSite(site)
            siteDrawerRef.current?.open()
          },
        },
        siteId,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const columns = useTableColumns<Account>(
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
          id: 'loginOrEmail',
          header: 'Login or email',
          accessor: (row) => <CopyableLabel maxWidth="8rem">{row.loginOrEmail}</CopyableLabel>,
          encrypted: true,
        },
        {
          id: 'password',
          header: 'Password',
          accessor: (row) => <CopyableLabel maxWidth="8rem">{row.password}</CopyableLabel>,
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
            <Tooltip title="Show details">
              <LoadingIconButton
                size="small"
                onClick={() => {
                  setOpenSiteForAccountId(account.id)
                  handleShowSite(account.siteId)
                }}
                loading={openSiteForAccountId === account.id && gettingSiteRequest}
              >
                <VisibilityRounded />
              </LoadingIconButton>
            </Tooltip>
          ),
          cellSx: {
            py: 0,
          },
        },
      ],
    },
    [gettingSiteRequest, handleShowSite, openSiteForAccountId],
  )

  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null)
  const [openAccountDeleteDialog, setOpenAccountDeleteDialog] = useState(false)

  const handleAdd = useCallback(() => {
    setAccountToEdit(null)
    accountDrawerRef.current?.open()
  }, [])
  const finalizeAccountActionSuccess = useCallback(() => {
    accountDrawerRef.current?.close()
    tableRef.current?.refresh()
  }, [])

  const handleDelete = useCallback((account: Account) => {
    setAccountToDelete(account)
    setOpenAccountDeleteDialog(true)
  }, [])
  const handleDeleteConfirm = useCallback(() => {
    if (!accountToDelete) {
      return
    }
    deleteAccountRequest(
      {
        onSuccess: (res, { enqueueSnackbar }) => {
          setOpenAccountDeleteDialog(false)
          tableRef.current?.refresh()
          enqueueSnackbar({ variant: 'success', message: 'Account deleted successfully' })
        },
      },
      accountToDelete.id,
    )
  }, [deleteAccountRequest, accountToDelete])

  const handleEdit = useCallback((account: Account) => {
    setAccountToEdit(account)
    accountDrawerRef.current?.open()
  }, [])

  const finalizeSiteActionSuccess = useCallback(() => {
    siteDrawerRef.current?.close()
  }, [])

  return (
    <>
      <CustomDrawer ref={siteDrawerRef} title="Site details">
        <SiteForm site={showSite} onSuccess={finalizeSiteActionSuccess} />
      </CustomDrawer>
      <CustomDrawer ref={accountDrawerRef} title={accountToEdit ? 'Update account' : 'Add account'}>
        <AccountForm account={accountToEdit} onSuccess={finalizeAccountActionSuccess} />
      </CustomDrawer>
      <ConfirmationDialog
        open={openAccountDeleteDialog}
        onClose={() => setOpenAccountDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        loading={deletingAccountRequest}
        titleContent="Confirm action"
        confirmButtonText="Delete"
      >
        Are you sure you want to delete account <strong>{accountToDelete?.loginOrEmail}</strong>?
      </ConfirmationDialog>
      <ViewTransition type={TransitionType.FADE}>
        <Box sx={{ height: '100%' }}>
          <Table
            ref={tableRef}
            columns={columns}
            keyProperty="id"
            data={getAccountsEncryptedRequest}
            onAdd={
              <EncryptedContentIconButton onClick={handleAdd} size="small">
                <AddRounded />
              </EncryptedContentIconButton>
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      </ViewTransition>
    </>
  )
}
