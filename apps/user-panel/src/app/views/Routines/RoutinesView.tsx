import { useMemo, useState } from 'react'
import { Stack } from '@mui/material'
import { TabsView, type TabSchema } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

const RoutinesView = ({ doNotRender }: ViewComponentProps) => {
  const [tabsReady, setTabsReady] = useState(true)

  const tabs = useMemo<TabSchema<string>[]>(
    () => [
      {
        value: 'xyz1',
        label: 'test1',
        content: <Stack>xyz1</Stack>,
      },
      {
        value: 'xyz2',
        label: 'test2',
        content: <Stack>xyz2</Stack>,
      },
      {
        value: 'xyz3',
        label: 'test3',
        content: <Stack>xyz3</Stack>,
      },
      {
        value: 'xyz4',
        label: 'test4',
        content: <Stack>xyz4</Stack>,
      },
      {
        value: 'xyz5',
        label: 'test5',
        content: <Stack>xyz5</Stack>,
      },
    ],
    [],
  )

  if (doNotRender) {
    return null
  }

  return (
    <TabsView
      name="routines"
      tabs={tabs}
      onAdd={() => void 0}
      addTooltip="Add routine"
      tabsProps={{ scrollButtons: tabsReady ? 'auto' : false, sx: { flexGrow: 1 } }}
      onTabsEntryAnimationStarted={() => setTabsReady(false)}
      onTabsEntryAnimationFinished={() => setTabsReady(true)}
    />
  )

  // TODO: Create, delete, or modify routines, and select existing data sources or create
  // new ones.
  // <br />
  // Routine will contain information about how data should be retrieved from data source which
  // is related to how many times routine will execute (eg.: running routine sequentially for
  // each item in data source).
  // <br />
  // Data source will be attached to routine when it is running.
  // <br />
  // Routine will expose method for currently performing action step which requires external data
  // in some cases (eg.: fill input action step).
  // <br />
  // This method will return data from data source according to current state of routine
  // execution which will be monitored.

  //TODO
  // Example self explanatory routine name: Update crypto prices
  // Testing routines will only be option for previewing puppeteer window

  // return (
  //   <ViewTransition>
  //     <Stack>xyz</Stack>
  //   </ViewTransition>
  // )
}
export default RoutinesView
