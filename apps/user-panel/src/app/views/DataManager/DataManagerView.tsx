import { useMemo } from 'react'
import { Accounts } from './Accounts'
import { Sites } from './Sites'
import type { TabSchema } from '../../components/common/TabsView'
import { TabsView } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

enum DataManagerTab {
  SITES,
  ACCOUNTS,
}

const DataManagerView = ({ doNotRender }: ViewComponentProps) => {
  const tabs = useMemo<TabSchema<DataManagerTab>[]>(
    () => [
      {
        value: DataManagerTab.SITES,
        label: 'Sites',
        content: <Sites />,
      },
      {
        value: DataManagerTab.ACCOUNTS,
        label: 'Accounts',
        content: <Accounts />,
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
