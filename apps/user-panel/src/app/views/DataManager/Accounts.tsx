import { Box } from '@mui/material'
import type { Account } from '@web-scrapper/common'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { Table, useTableColumns } from '../../components/table'

export const Accounts = () => {
  const columns = useTableColumns<Account>([
    {
      id: 'id',
      header: 'ID',
      accessor: 'id',
    },
    {
      id: 'loginOrEmail',
      header: 'Login or email',
      accessor: 'loginOrEmail',
    },
    {
      id: 'password',
      header: 'Password',
      accessor: 'password',
    },
    {
      id: 'additionalCredentialsData',
      header: 'Additional credentials data',
      accessor: (row) => row.additionalCredentialsData ?? '-',
    },
    {
      id: 'lastUsed',
      header: 'Last used',
      //TODO: custom parsing
      accessor: (row) => row.lastUsed?.toLocaleString() ?? 'Never',
    },
    {
      id: 'active',
      header: 'Active',
      accessor: (row) => (row.active ? 'Yes' : 'No'), //TODO: <BooleanValue value={row.active} />
    },
    {
      id: 'siteId',
      header: 'Site',
      accessor: 'siteId', //TODO: button opening details of site
    },
  ])

  return (
    <ViewTransition type={TransitionType.FADE}>
      <Box sx={{ height: '100%' }}>
        <Table columns={columns} keyProperty="id" data={window.electronAPI.getAccounts} />
      </Box>
    </ViewTransition>
  )
}
