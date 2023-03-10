import {
  type ReactNode,
  type RefAttributes,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Box, type BoxProps, Stack, Tab, tabClasses, Tabs, tabsClasses } from '@mui/material'
import anime from 'animejs'
import { usePersistentState } from '../../hooks/usePersistentState'
import { genericForwardRef, genericMemo } from '../../utils'
import { TransitionType, ViewTransition } from '../animation/ViewTransition'

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

const commonTabContentStyles: BoxProps['sx'] = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}

export const TabsView = genericMemo(
  genericForwardRef(
    <ValueType extends string | number>(
      { name, defaultTab, tabs }: TabsViewProps<ValueType> & RefAttributes<HTMLDivElement>,
      ref: RefAttributes<HTMLDivElement>['ref'],
    ) => {
      const containerRef = useRef<HTMLDivElement>(null)
      const contentContainerRef = useRef<HTMLDivElement>(null)
      const isAnimatingRef = useRef(false)

      const [previousTab, setPreviousTab] = useState<ValueType | null>(null)
      const [tab, setTab] = usePersistentState(`${name}-tab`, defaultTab ?? tabs[0].value)
      const [tabSwitchIndex, setTabSwitchIndex] = usePersistentState(`${name}-tab-switch-index`, 0)

      const selectedTab = tabs.find(({ value }) => value === tab)
      const previousTabContent = tabs.find(({ value }) => value === previousTab)?.content

      const calculateDirection = useCallback(
        (previous: ValueType, next: ValueType) => {
          const nextTabIndex = tabs.findIndex(({ value }) => value === next)
          const previousTabIndex = tabs.findIndex(({ value }) => value === previous)
          return previousTabIndex > nextTabIndex ? -1 : 1
        },
        [tabs],
      )

      useEffect(() => {
        if (!contentContainerRef.current || previousTab === null) {
          return
        }

        const direction = calculateDirection(previousTab, tab)

        const tabContentTarget = contentContainerRef.current.querySelector('.tab-content-1')

        anime.remove(tabContentTarget)
        anime({
          targets: tabContentTarget,
          translateX: tabSwitchIndex % 2 !== 0 ? `${-100 * direction}%` : '0%',
          opacity: tabSwitchIndex % 2 !== 0 ? 0 : 1,
          easing: 'easeInOutCirc',
          duration: 500,
          delay: tabSwitchIndex % 2 === 0 ? 100 : 0,
        })

        const previousTabContentTarget = contentContainerRef.current.querySelector('.tab-content-2')

        anime.remove(previousTabContentTarget)
        anime({
          targets: previousTabContentTarget,
          translateX: tabSwitchIndex % 2 !== 0 ? '0%' : `${-100 * direction}%`,
          opacity: tabSwitchIndex % 2 !== 0 ? 1 : 0,
          easing: 'easeInOutCirc',
          duration: 500,
          delay: tabSwitchIndex % 2 !== 0 ? 100 : 0,
          complete: () => {
            isAnimatingRef.current = false
            setPreviousTab(null)
          },
        })

        isAnimatingRef.current = true
      }, [tabSwitchIndex, previousTab, tab, tabs, calculateDirection])

      const handleTabChange = useCallback(
        (event: SyntheticEvent, newTab: ValueType) => {
          setPreviousTab(tab)
          setTab(newTab)

          if (contentContainerRef.current && !isAnimatingRef.current) {
            const direction = calculateDirection(tab, newTab)

            const tabContentTarget = contentContainerRef.current.querySelector(
              '.tab-content-1',
            ) as HTMLDivElement
            if (tabContentTarget) {
              tabContentTarget.style.transform =
                tabSwitchIndex % 2 === 0 ? 'translateX(0%)' : `translateX(${100 * direction}%)`
            }

            const previousTabContentTarget = contentContainerRef.current.querySelector(
              '.tab-content-2',
            ) as HTMLDivElement
            if (previousTabContentTarget) {
              previousTabContentTarget.style.transform =
                tabSwitchIndex % 2 === 0 ? `translateX(${100 * direction}%)` : 'translateX(0%)'
            }
          }

          setTabSwitchIndex((index) => index + 1)
        },
        [tab, setTab, setTabSwitchIndex, calculateDirection, tabSwitchIndex],
      )

      return (
        <Stack
          ref={ref ?? containerRef}
          alignItems="stretch"
          maxHeight="100%"
          overflow="hidden"
          flexGrow={1}
        >
          <ViewTransition
            targets={(element) => element.querySelectorAll(`.${tabsClasses.indicator}`)}
            type={TransitionType.SCALE_X}
            delay={1}
          >
            <ViewTransition
              targets={(element) => element.querySelectorAll(`.${tabClasses.root}`)}
              type={TransitionType.MOVE_TOP}
            >
              <Tabs value={tab} onChange={handleTabChange}>
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
            </ViewTransition>
          </ViewTransition>
          <Stack ref={contentContainerRef} alignItems="stretch" flexGrow={1} position="relative">
            <Box
              className="tab-content-1"
              sx={{
                ...commonTabContentStyles,
                pointerEvents: tabSwitchIndex % 2 === 0 ? 'auto' : 'none',
              }}
            >
              {tabSwitchIndex % 2 === 0 ? selectedTab?.content : previousTabContent}
            </Box>
            <Box
              className="tab-content-2"
              sx={{
                ...commonTabContentStyles,
                pointerEvents: tabSwitchIndex % 2 !== 0 ? 'auto' : 'none',
              }}
            >
              {tabSwitchIndex % 2 !== 0 ? selectedTab?.content : previousTabContent}
            </Box>
          </Stack>
        </Stack>
      )
    },
  ),
)
