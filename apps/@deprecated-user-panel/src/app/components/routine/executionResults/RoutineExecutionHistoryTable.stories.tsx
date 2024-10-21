import type { Meta, StoryObj } from '@storybook/react'
import { ProcedureType, RoutineExecutionType, type Routine } from '@web-scraper/common'
import { RoutineExecutionHistoryTable } from './RoutineExecutionHistoryTable'
import { CustomDrawer } from '../../common/CustomDrawer'

const meta = {
  title: 'Routine/RoutineExecutionHistoryTable',
  component: RoutineExecutionHistoryTable,
  decorators: [
    (Story) => {
      return (
        <CustomDrawer title="Routine execution history" defaultOpen anchor="bottom">
          <Story />
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
  },
} satisfies Meta<typeof RoutineExecutionHistoryTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
