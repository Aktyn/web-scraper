import { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { RoutineExecutionType } from '@web-scraper/common'
import { ExecutionPlanRowsPreview } from './ExecutionPlanRowsPreview'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { CustomPopover, type CustomPopoverRef } from '../common/CustomPopover'

const meta = {
  title: 'Routine/ExecutionPlanRowsPreview',
  component: ExecutionPlanRowsPreview,
  decorators: [
    (Story) => {
      const executionPlanRowsPreviewPopoverRef = useRef<CustomPopoverRef>(null)
      const { loadDataSources, dataSources, loadingDataSources } = useDataSourcesLoader()

      useEffect(() => {
        void loadDataSources()
        const anchor = document.querySelector<HTMLDivElement>('body > div')
        if (anchor) {
          executionPlanRowsPreviewPopoverRef.current?.open(anchor)
        }
      }, [loadDataSources])

      return (
        <CustomPopover
          ref={executionPlanRowsPreviewPopoverRef}
          TransitionProps={{ unmountOnExit: true }}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          slotProps={{
            paper: { sx: { display: 'flex' } },
          }}
        >
          <DataSourcesContext.Provider value={dataSources ?? []}>
            {!loadingDataSources && <Story />}
          </DataSourcesContext.Provider>
        </CustomPopover>
      )
    },
  ],
  parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof ExecutionPlanRowsPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    executionPlan: {
      type: RoutineExecutionType.SPECIFIC_IDS,
      dataSourceName: 'Example',
      ids: [1, 2, 3],
    },
  },
}
