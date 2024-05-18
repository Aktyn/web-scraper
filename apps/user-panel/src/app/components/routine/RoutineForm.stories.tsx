import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ProcedureType, RoutineExecutionType, type Routine } from '@web-scraper/common'
import { RoutineForm } from './RoutineForm'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { CustomDrawer } from '../common/CustomDrawer'

const meta = {
  title: 'Routine/RoutineForm',
  component: RoutineForm,
  decorators: [
    (Story) => {
      const { loadDataSources, dataSources, loadingDataSources } = useDataSourcesLoader()

      useEffect(() => {
        void loadDataSources()
      }, [loadDataSources])

      return (
        <CustomDrawer title="Routine form" defaultOpen>
          <DataSourcesContext.Provider value={dataSources ?? []}>
            {!loadingDataSources && <Story />}
          </DataSourcesContext.Provider>
        </CustomDrawer>
      )
    },
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    routine: {
      id: 1,
      name: 'Routine 1',
      description: 'Example routine',
      stopOnError: true,
      procedures: [
        {
          id: 1,
          name: 'Get title from example site',
          type: ProcedureType.DATA_RETRIEVAL,
          startUrl: `{{URL.ORIGIN}}`,
          waitFor: 'body > div:nth-child(1) > h1',
          siteInstructionsId: 1,
          flow: {
            id: 1,
            actionName: 'action.Foo',
            globalReturnValues: [],
            onSuccess: {
              id: 2,
              actionName: 'global.finishProcedure',
              globalReturnValues: [],
              onSuccess: null,
              onFailure: null,
            },
            onFailure: {
              id: 3,
              actionName: 'global.finishProcedureWithError',
              globalReturnValues: [],
              onSuccess: null,
              onFailure: null,
            },
          },
        },
      ],
      executionPlan: {
        type: RoutineExecutionType.STANDALONE,
        repeat: 4,
      },
    } satisfies Routine,
    onSuccess: fn(),
  },
} satisfies Meta<typeof RoutineForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Empty: Story = { args: { routine: null } }
