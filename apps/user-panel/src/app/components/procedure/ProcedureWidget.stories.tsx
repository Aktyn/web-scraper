import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ProcedureType, type Procedure } from '@web-scraper/common'
import { ProcedureWidget as ProcedureWidgetComponent } from './ProcedureWidget'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'

const mockProcedure = {
  id: 1,
  name: 'Get title from example site',
  startUrl: '{{URL.ORIGIN}}',
  waitFor: 'body > div:nth-child(1) > h1',
  siteInstructionsId: 1,
  type: ProcedureType.DATA_RETRIEVAL,
  flow: {
    id: 3,
    globalReturnValues: [],
    actionName: 'action.Get title',
    onSuccess: {
      id: 1,
      globalReturnValues: [],
      actionName: 'global.finishProcedure',
      onSuccess: null,
      onFailure: null,
    },
    onFailure: {
      id: 2,
      globalReturnValues: [],
      actionName: 'global.finishProcedureWithError',
      onSuccess: null,
      onFailure: null,
    },
  },
} satisfies Procedure

const meta = {
  title: 'Procedure/ProcedureWidget',
  component: ProcedureWidgetComponent,
  decorators: [
    (Story) => {
      const { loadDataSources, dataSources, loadingDataSources } = useDataSourcesLoader()

      useEffect(() => {
        void loadDataSources()
      }, [loadDataSources])

      return (
        <DataSourcesContext.Provider value={dataSources ?? []}>
          {!loadingDataSources && <Story />}
        </DataSourcesContext.Provider>
      )
    },
  ],
  parameters: { layout: 'centered' },
  args: {
    procedure: mockProcedure,
  },
} satisfies Meta<typeof ProcedureWidgetComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    groupedSiteProcedures: [
      {
        site: {
          id: 1,
          url: 'https://example.com',
          createdAt: new Date(0),
          language: null,
          tags: [],
        },
        procedures: [mockProcedure],
      },
    ],
  },
}

export const LoadingSiteInfo: Story = {
  args: { groupedSiteProcedures: [] },
}
