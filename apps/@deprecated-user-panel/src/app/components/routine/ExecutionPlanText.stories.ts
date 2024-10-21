import type { Meta, StoryObj } from '@storybook/react'
import { DataSourceColumnType, RoutineExecutionType } from '@web-scraper/common'
import { ExecutionPlanText } from './ExecutionPlanText'

const meta = {
  title: 'Routine/ExecutionPlanText',
  component: ExecutionPlanText,
  parameters: { layout: 'centered' },
  args: {},
} satisfies Meta<typeof ExecutionPlanText>

export default meta
type Story = StoryObj<typeof meta>

export const Standalone: Story = {
  args: { executionPlan: { type: RoutineExecutionType.STANDALONE, repeat: 3 } },
}

export const SpecificIDS: Story = {
  args: {
    executionPlan: {
      type: RoutineExecutionType.SPECIFIC_IDS,
      dataSourceName: 'Example',
      ids: [1, 2, 3],
    },
  },
}

export const ExceptSpecificIDS: Story = {
  args: {
    executionPlan: {
      type: RoutineExecutionType.EXCEPT_SPECIFIC_IDS,
      dataSourceName: 'Example',
      ids: [1, 2, 3],
    },
  },
}

export const MatchSequentially: Story = {
  args: {
    executionPlan: {
      type: RoutineExecutionType.MATCH_SEQUENTIALLY,
      dataSourceName: 'Example',
      filters: [
        {
          columnName: 'Title',
          columnType: DataSourceColumnType.TEXT,
          where: {
            contains: 'text fragment',
          },
        },
      ],
      maximumIterations: 7,
    },
  },
}
