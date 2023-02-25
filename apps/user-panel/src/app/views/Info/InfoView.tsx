import { useMemo } from 'react'
import { Terms } from './Terms'
import { type TabSchema, TabsView } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

enum InfoTab {
  TERMS,
}

const InfoView = ({ doNotRender }: ViewComponentProps) => {
  const tabs = useMemo<TabSchema<InfoTab>[]>(
    () => [
      {
        value: InfoTab.TERMS,
        label: 'Terms',
        content: <Terms />,
      },
    ],
    [],
  )

  if (doNotRender) {
    return null
  }

  return <TabsView name="info" tabs={tabs} />
}
export default InfoView
