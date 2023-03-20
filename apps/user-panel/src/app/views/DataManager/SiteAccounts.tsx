import { useCallback } from 'react'
import { Divider, Stack } from '@mui/material'
import type { Account, PaginatedApiFunction, Site } from '@web-scrapper/common'
import { CopyableLabel } from 'src/app/components/common/CopyableLabel'
import { UrlButton } from '../../components/common/button/UrlButton'
import { Table, useTableColumns } from '../../components/table'
import { useEncryptedApiRequest } from '../../components/table/useEncryptedApiRequest'

interface SiteAccountsProps {
  site: Site
}

export const SiteAccounts = ({ site }: SiteAccountsProps) => {
  const columns = useTableColumns<Account>([
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
      id: 'lastUsed',
      header: 'Last used',
      accessor: 'lastUsed',
    },
    {
      id: 'active',
      header: 'Active',
      accessor: 'active',
    },
  ])

  const getAccountsRequest = useEncryptedApiRequest(window.electronAPI.getAccounts)
  const getSiteAccountsRequest = useCallback<PaginatedApiFunction<Account, 'id'>>(
    (request) =>
      getAccountsRequest({
        ...request,
        filters: [...(request.filters ?? []), { siteId: site.id }],
      }),
    [getAccountsRequest, site.id],
  )

  return (
    <Stack flexGrow={1} pt={2} overflow="auto">
      <UrlButton width="100%" maxWidth="16rem" justifyContent="center" p={2} pt={0} mx="auto">
        {site.url}
      </UrlButton>
      <Divider />
      <Table columns={columns} keyProperty="id" data={getSiteAccountsRequest} />
    </Stack>
  )
}