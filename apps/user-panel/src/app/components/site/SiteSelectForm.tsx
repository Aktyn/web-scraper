import { useCallback, useRef, useState } from 'react'
import { AddRounded } from '@mui/icons-material'
import { IconButton, Stack, Tooltip } from '@mui/material'
import type { Site, PaginatedApiFunction } from '@web-scraper/common'
import { UrlButton } from '../common/button/UrlButton'
import { SearchInput } from '../common/input/SearchInput'
import { Table, type TableRef, useTableColumns } from '../table'
import { BooleanValue } from '../table/BooleanValue'
import { TagsCellValue } from '../table/TagsCellValue'

interface SiteSelectFormProps {
  site?: Site | null
  onSelect: (site: Site) => void
}

export const SiteSelectForm = ({ site: selectedSite, onSelect }: SiteSelectFormProps) => {
  const tableRef = useRef<TableRef>(null)

  const [searchValue, setSearchValue] = useState('')

  const columns = useTableColumns<Site>(
    {
      definitions: [
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
        {
          id: 'options',
          header: '',
          accessor: (site) =>
            selectedSite?.id === site.id ? (
              <BooleanValue value={true} sx={{ justifyContent: 'center' }} />
            ) : (
              <Tooltip title="Select">
                <IconButton size="small" onClick={() => onSelect?.(site)}>
                  <AddRounded />
                </IconButton>
              </Tooltip>
            ),
          cellSx: {
            textAlign: 'center',
            py: 0,
          },
        },
      ],
    },
    [],
  )

  const searchSitesRequest = useCallback<PaginatedApiFunction<Site, 'id'>>(
    (request) =>
      searchValue
        ? window.electronAPI.getSites({
            ...request,
            filters: [
              ...(request.filters ?? []),
              {
                url: {
                  contains: searchValue,
                },
              },
            ],
          })
        : window.electronAPI.getSites(request),
    [searchValue],
  )

  return (
    <Stack flexGrow={1}>
      <Table
        ref={tableRef}
        columns={columns}
        headerContent={<SearchInput size="small" value={searchValue} onChange={setSearchValue} />}
        keyProperty="id"
        data={searchSitesRequest}
      />
    </Stack>
  )
}
