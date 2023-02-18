import type { ReactNode, RefAttributes } from 'react'
import { useRef } from 'react'
import { Stack, Tab, Tabs } from '@mui/material'
import { usePersistentState } from '../../hooks/usePersistentState'
import { genericForwardRef, genericMemo } from '../../utils'

export interface TabSchema<ValueType> {
  value: ValueType
  label: ReactNode
  content: ReactNode
}

interface TabsViewProps<ValueType> {
  name: string
  defaultTab?: ValueType
  tabs: TabSchema<ValueType>[]
}

export const TabsView = genericMemo(
  genericForwardRef(
    <ValueType extends string | number>(
      { name, defaultTab, tabs }: TabsViewProps<ValueType> & RefAttributes<HTMLDivElement>,
      ref: RefAttributes<HTMLDivElement>['ref'],
    ) => {
      const containerRef = useRef<HTMLDivElement>(null)

      const [tab, setTab] = usePersistentState(`${name}-tab`, defaultTab ?? tabs[0].value)

      const selectedTab = tabs.find(({ value }) => value === tab)

      return (
        <Stack ref={ref ?? containerRef} alignItems="stretch" maxHeight="100%" overflow="hidden">
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Stack alignItems="stretch" overflow="auto" flexGrow={1}>
            {selectedTab?.content}
          </Stack>
        </Stack>
      )
    },
  ),
)
