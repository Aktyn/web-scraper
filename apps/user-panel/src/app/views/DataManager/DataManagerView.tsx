import { useMemo } from 'react'
import { Accounts } from './Accounts'
import { SiteTags } from './SiteTags'
import { Sites } from './Sites'
import type { TabSchema } from '../../components/common/TabsView'
import { TabsView } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

enum DataManagerTab {
  SITES,
  ACCOUNTS,
  SITE_TAGS,
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
      {
        value: DataManagerTab.SITE_TAGS,
        label: 'Site tags',
        content: <SiteTags />,
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
