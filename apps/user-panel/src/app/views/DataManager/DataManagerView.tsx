import { useMemo } from 'react'
import { Accounts } from './Accounts'
import { Sites } from './Sites'
import type { TabSchema } from '../../components/common/TabsView'
import { TabsView } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

enum DataManagerTab {
  ACCOUNTS,
  SITES,
}

const DataManagerView = ({ doNotRender }: ViewComponentProps) => {
  const tabs = useMemo<TabSchema<DataManagerTab>[]>(
    () => [
      {
        value: DataManagerTab.ACCOUNTS,
        label: 'Accounts',
        content: <Accounts />,
      },
      {
        value: DataManagerTab.SITES,
        label: 'Sites',
        content: <Sites />,
      },
    ],
    [],
  )

  if (doNotRender) {
    return null
  }

  return <TabsView name="data-manager" tabs={tabs} />
}
export default DataManagerView
