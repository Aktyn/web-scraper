import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import type { Site } from '@web-scraper/common'
import { SiteInstructionsForm } from './SiteInstructionsForm'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { CustomDrawer } from '../common/CustomDrawer'

const meta = {
  title: 'SiteInstructions/SiteInstructionsForm',
  component: SiteInstructionsForm,
  decorators: [
    (Story) => {
      const { loadDataSources, dataSources, loadingDataSources } = useDataSourcesLoader()

      useEffect(() => {
        void loadDataSources()
      }, [loadDataSources])

      return (
        <CustomDrawer title="Site instructions form" defaultOpen>
          <DataSourcesContext.Provider value={dataSources ?? []}>
            {!loadingDataSources && <Story />}
          </DataSourcesContext.Provider>
        </CustomDrawer>
      )
    },
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    site: {
      id: 1,
      createdAt: new Date(1715164444961),
      url: 'http://example.com',
      language: 'en',
      tags: [
        {
          id: 1,
          name: 'Foo',
          description: null,
        },
      ],
    } satisfies Site,
    onSuccess: fn(),
  },
} satisfies Meta<typeof SiteInstructionsForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
