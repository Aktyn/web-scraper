import { useMemo } from 'react'
import { AboutProject } from './AboutProject'
import { Terms } from './Terms'
import { type TabSchema, TabsView } from '../../components/common/TabsView'
import type { ViewComponentProps } from '../helpers'

enum InfoTab {
  TERMS,
  ABOUT,
}

const InfoView = ({ doNotRender }: ViewComponentProps) => {
  const tabs = useMemo<TabSchema<InfoTab>[]>(
    () => [
      {
        value: InfoTab.TERMS,
        label: 'Terms',
        content: <Terms />,
      },
      {
        value: InfoTab.ABOUT,
        label: 'About project',
        content: <AboutProject />,
      },
    ],
    [],
  )

  if (doNotRender) {
    return null
  }

  return <TabsView name="info" tabs={tabs} tabsProps={{ scrollButtons: false }} />
}
export default InfoView
