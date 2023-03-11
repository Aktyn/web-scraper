import { Box, Chip, Link, Stack, Tooltip } from '@mui/material'
import type { Site } from '@web-scrapper/common'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { Table, useTableColumns } from '../../components/table'

export const Sites = () => {
  const columns = useTableColumns<Site>([
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
      accessor: (site) => (
        <Link
          href={site.url}
          target="_blank"
          sx={{ maxWidth: '4rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {site.url}
        </Link>
      ),
    },
    {
      id: 'language',
      header: 'Language',
      accessor: 'language',
    },
    {
      id: 'tags',
      header: 'Tags',
      accessor: (site) => (
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            maxWidth: '16rem',
            overflowX: 'auto',
            //TODO: button opening popup with list of all tags when their number exceeds certain amount
          }}
        >
          {site.tags.map((tag) => (
            <Tooltip key={tag.id} title={tag.description} disableInteractive>
              <Chip
                label={tag.name}
                sx={{ fontWeight: 'bold', color: 'text.primary' }}
                variant="filled"
                size="small"
                //TODO: colorize tags
                color="default"
              />
            </Tooltip>
          ))}
        </Stack>
      ),
    },
  ])

  return (
    <ViewTransition type={TransitionType.FADE}>
      <Box sx={{ height: '100%' }}>
        <Table columns={columns} keyProperty="id" data={window.electronAPI.getSites} />
      </Box>
    </ViewTransition>
  )
}
