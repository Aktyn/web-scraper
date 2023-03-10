import { Box } from '@mui/material'
import type { Account } from '@web-scrapper/common'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { Table, useTableColumns } from '../../components/table'
import { useEncryptedApiRequest } from '../../components/table/useEncryptedApiRequest'

export const Accounts = () => {
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
      accessor: 'loginOrEmail',
      encrypted: true,
    },
    {
      id: 'password',
      header: 'Password',
      accessor: 'password',
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
      accessor: 'siteId', //TODO: button opening site configuration details
    },
  ])

  const getAccountsRequest = useEncryptedApiRequest(window.electronAPI.getAccounts)

  return (
    <ViewTransition type={TransitionType.FADE}>
      <Box sx={{ height: '100%' }}>
        <Table columns={columns} keyProperty="id" data={getAccountsRequest} />
      </Box>
    </ViewTransition>
  )
}
