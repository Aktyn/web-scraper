import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefAttributes,
  type SyntheticEvent,
} from 'react'
import { AddRounded } from '@mui/icons-material'
import {
  Box,
  Divider,
  IconButton,
  Stack,
  type StackProps,
  Tab,
  Tabs,
  Tooltip,
  tabClasses,
  tabsClasses,
  type BoxProps,
  type TabProps,
  type TabsProps,
} from '@mui/material'
import anime from 'animejs'
import { usePersistentState } from '../../hooks/usePersistentState'
import { genericForwardRef, genericMemo } from '../../utils'
import { TransitionType, ViewTransition } from '../animation/ViewTransition'

export interface TabsHandle<ValueType> {
  changeTab: (tab: ValueType) => void
}

export interface TabSchema<ValueType> {
  value: ValueType
  label: ReactNode
  content: ReactNode
  tabComponentProps?: Omit<TabProps, 'value' | 'label' | 'key'>
}

interface TabsViewProps<ValueType> {
  name: string
  defaultTab?: ValueType
  tabs: TabSchema<ValueType>[]
  addTooltip?: ReactNode
  onAdd?: () => void
  handleRef?: Ref<TabsHandle<ValueType>>
  tabsProps?: Omit<TabsProps, 'value' | 'onChange'>
  onTabsEntryAnimationStarted?: () => void
  onTabsEntryAnimationFinished?: () => void
}

export const TabsView = genericMemo(
  genericForwardRef(
    <ValueType extends string | number>(
      {
        name,
        defaultTab,
        tabs,
        addTooltip,
        onAdd,
        handleRef,
        tabsProps,
        onTabsEntryAnimationStarted,
        onTabsEntryAnimationFinished,
        ...stackProps
      }: TabsViewProps<ValueType> & RefAttributes<HTMLDivElement> & StackProps,
      ref: Ref<HTMLDivElement>,
    ) => {
      const containerRef = useRef<HTMLDivElement>(null)
      const contentContainerRef = useRef<HTMLDivElement>(null)
      const isAnimatingRef = useRef(false)

      const [previousTab, setPreviousTab] = useState<ValueType | null>(null)
      const [tab, setTab] = usePersistentState(
        `${name}-tab`,
        defaultTab ?? tabs.at(0)?.value ?? null,
      )
      const [tabSwitchIndex, setTabSwitchIndex] = usePersistentState(`${name}-tab-switch-index`, 0)

      const selectedTab = tabs.find(({ value }) => value === tab)
      const previousTabContent = tabs.find(({ value }) => value === previousTab)?.content

      const calculateDirection = useCallback(
        (previous: ValueType | null, next: ValueType | null) => {
          const nextTabIndex = tabs.findIndex(({ value }) => value === next)
          const previousTabIndex = tabs.findIndex(({ value }) => value === previous)
          return previousTabIndex > nextTabIndex ? -1 : 1
        },
        [tabs],
      )

      useEffect(() => {
        if (!tabs.length) {
          return
        }
        if (!tabs.some(({ value }) => value === tab)) {
          setTab(tabs.at(0)?.value ?? null)
        }
      }, [setTab, tab, tabs])

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
        (_: SyntheticEvent | null, newTab: ValueType) => {
          setTab((currentTab) => {
            setPreviousTab(currentTab)

            if (contentContainerRef.current && !isAnimatingRef.current) {
              const direction = calculateDirection(currentTab, newTab)

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

            return newTab
          })
        },
        [calculateDirection, setTab, setTabSwitchIndex, tabSwitchIndex],
      )

      useImperativeHandle(
        handleRef,
        () => ({
          changeTab: (tab) => handleTabChange(null, tab),
        }),
        [handleTabChange],
      )

      const activeTab = tabs.some((t) => t.value === tab) ? tab : (tabs.at(0)?.value ?? null)

      return (
        <Stack
          ref={ref ?? containerRef}
          flexGrow={1}
          alignItems="stretch"
          maxHeight="100%"
          height="100%"
          overflow="hidden"
          {...stackProps}
        >
          <ViewTransition
            targets={(element) => element.querySelectorAll(`.${tabsClasses.indicator}`)}
            type={TransitionType.SCALE_X}
            delay={1}
          >
            <ViewTransition
              targets={(element) =>
                [
                  ...element.querySelectorAll(`.${tabClasses.root}`),
                  element.querySelector('.tabs-add-button-separator'),
                  element.querySelector('.tabs-add-button'),
                ].filter(Boolean)
              }
              type={TransitionType.MOVE_TOP}
              onAnimationStarted={onTabsEntryAnimationStarted}
              onAnimationFinished={onTabsEntryAnimationFinished}
            >
              <Stack direction="row" mr={onAdd ? undefined : 'auto'} maxWidth="100%">
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  {...tabsProps}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                      {...tab.tabComponentProps}
                    />
                  ))}
                </Tabs>
                {onAdd && (
                  <>
                    <Divider
                      className="tabs-add-button-separator"
                      orientation="vertical"
                      flexItem
                    />
                    <Stack
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                      width="3.5rem"
                      px="0.5rem"
                    >
                      <Tooltip title={addTooltip}>
                        <IconButton className="tabs-add-button" color="inherit" onClick={onAdd}>
                          <AddRounded />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </>
                )}
              </Stack>
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

const commonTabContentStyles: BoxProps['sx'] = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}
