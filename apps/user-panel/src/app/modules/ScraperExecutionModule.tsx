import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type DependencyList,
  type PropsWithChildren,
} from 'react'
import {
  ElectronToRendererMessage,
  ScraperExecutionScope,
  ScraperMode,
  type ScraperExecutionFinishedSchema,
  type ScraperExecutionResultSchema,
  type ScraperExecutionStartSchema,
} from '@web-scraper/common'
import { ApiModule } from './ApiModule'
import { ScraperTestingExecutionDialog } from '../components/scraperExecution/ScraperTestingExecutionDialog'
import { noop } from '../utils'

export type AnyScraperExecutionType =
  | ({
      id: string
      event: ElectronToRendererMessage.scraperExecutionStarted
    } & ScraperExecutionStartSchema)
  | ({
      id: string
      event: ElectronToRendererMessage.scraperExecutionResult
    } & ScraperExecutionResultSchema)
  | ({
      id: string
      event: ElectronToRendererMessage.scraperExecutionFinished
    } & ScraperExecutionFinishedSchema)

type ScraperExecutionMap = Map<
  string, //scraperId
  { execution: AnyScraperExecutionType[]; finished: boolean }
>

interface ScraperExecutionsDetails {
  [ScraperMode.ROUTINE_EXECUTION]: ScraperExecutionMap
  [ScraperMode.TESTING]: ScraperExecutionMap
}

export interface ScraperExecutionLite {
  scraperId: string
  mode: ScraperMode
  scope: ScraperExecutionScope
}

type ScraperExecutionChangeListenerType = (
  scraperId: string,
  mode: ScraperMode,
  execution: { execution: AnyScraperExecutionType[]; finished: boolean },
) => void

const ScraperExecutionContext = createContext({
  scraperExecutions: [] as ScraperExecutionLite[],
  addChangeListener: noop as (listener: ScraperExecutionChangeListenerType) => void,
  removeChangeListener: noop as (listener: ScraperExecutionChangeListenerType) => void,
  getExecutionData: noop as (
    scraperId: string,
    mode: ScraperMode,
  ) =>
    | {
        execution: AnyScraperExecutionType[]
        finished: boolean
      }
    | undefined,
})

function getCurrentExecution(
  executionMap: ScraperExecutionMap,
  scraperId: string,
  scope: ScraperExecutionScope,
) {
  const currentExecution = executionMap.get(scraperId)
  if (!currentExecution?.execution.length) {
    return null
  }
  if (
    scraperExecutionScopeLevels[currentExecution.execution[0].scope] <
    scraperExecutionScopeLevels[scope]
  ) {
    throw new Error('Scraper execution scope is not valid')
  }
  return currentExecution
}

const ScraperExecutionProvider = ({ children }: PropsWithChildren) => {
  const scraperExecutionsRef = useRef<ScraperExecutionsDetails>({
    [ScraperMode.ROUTINE_EXECUTION]: new Map(),
    [ScraperMode.TESTING]: new Map(),
  })
  const scraperExecutionChangeListenersRef = useRef(new Set<ScraperExecutionChangeListenerType>())

  const [scraperExecutions, setScraperExecutions] = useState<ScraperExecutionLite[]>([])

  const getExecutionData = useCallback((scraperId: string, mode: ScraperMode) => {
    assertScraperMode(mode !== ScraperMode.PREVIEW)
    const map = scraperExecutionsRef.current[mode]
    return map.get(scraperId)
  }, [])

  const addChangeListener = useCallback(
    (listener: ScraperExecutionChangeListenerType) =>
      scraperExecutionChangeListenersRef.current.add(listener),
    [],
  )
  const removeChangeListener = useCallback(
    (listener: ScraperExecutionChangeListenerType) =>
      scraperExecutionChangeListenersRef.current.delete(listener),
    [],
  )

  const emitScraperExecutionChange = useCallback(
    (scraperId: string, mode: ScraperMode, map: ScraperExecutionMap) =>
      scraperExecutionChangeListenersRef.current.forEach((listener) => {
        const executionData = map.get(scraperId)
        if (!executionData) {
          throw new Error('Scraper execution not found')
        }
        listener(scraperId, mode, executionData)
      }),
    [],
  )

  ApiModule.useEvent(
    ElectronToRendererMessage.scraperExecutionStarted,
    (_, scraperId, mode, executionId, data) => {
      assertScraperMode(mode !== ScraperMode.PREVIEW)
      const map = scraperExecutionsRef.current[mode]
      const currentExecution = getCurrentExecution(map, scraperId, data.scope)

      if (!currentExecution) {
        map.set(scraperId, {
          execution: [
            { id: executionId, event: ElectronToRendererMessage.scraperExecutionStarted, ...data },
          ],
          finished: false,
        })
        setScraperExecutions((executions) => [
          ...executions,
          { scraperId, mode, scope: data.scope },
        ])
      } else {
        currentExecution.execution.push({
          id: executionId,
          event: ElectronToRendererMessage.scraperExecutionStarted,
          ...data,
        })
      }

      emitScraperExecutionChange(scraperId, mode, map)
    },
  )
  ApiModule.useEvent(
    ElectronToRendererMessage.scraperExecutionResult,
    (_, scraperId, mode, executionId, data) => {
      assertScraperMode(mode !== ScraperMode.PREVIEW)
      const map = scraperExecutionsRef.current[mode]
      const currentExecution = getCurrentExecution(map, scraperId, data.scope)
      if (!currentExecution) {
        throw new Error('Scraper execution not found')
      } else {
        currentExecution.execution.push({
          id: executionId,
          event: ElectronToRendererMessage.scraperExecutionResult,
          ...data,
        })
      }

      emitScraperExecutionChange(scraperId, mode, map)
    },
  )
  ApiModule.useEvent(
    ElectronToRendererMessage.scraperExecutionFinished,
    (_, scraperId, mode, executionId, data) => {
      assertScraperMode(mode !== ScraperMode.PREVIEW)
      const map = scraperExecutionsRef.current[mode]
      const currentExecution = getCurrentExecution(map, scraperId, data.scope)
      if (!currentExecution) {
        throw new Error('Scraper execution not found')
      } else {
        currentExecution.execution.push({
          id: executionId,
          event: ElectronToRendererMessage.scraperExecutionFinished,
          ...data,
        })
        currentExecution.finished = currentExecution.execution[0].scope === data.scope
      }

      emitScraperExecutionChange(scraperId, mode, map)
    },
  )

  return (
    <ScraperExecutionContext.Provider
      value={{ scraperExecutions, getExecutionData, addChangeListener, removeChangeListener }}
    >
      {children}
      {scraperExecutions.map((execution) => {
        const mode = execution.mode
        if (mode !== ScraperMode.TESTING) {
          return null
        }

        return (
          <ScraperTestingExecutionDialog
            key={execution.scraperId}
            {...execution}
            open
            onClose={() => {
              const executionData = scraperExecutionsRef.current[mode].get(execution.scraperId)
              if (!executionData?.finished) {
                console.error('Scraping is not finished')
              }

              scraperExecutionsRef.current[mode].delete(execution.scraperId)
              setScraperExecutions((executions) =>
                executions.filter((e) => e.scraperId !== execution.scraperId),
              )
            }}
          />
        )
      })}
    </ScraperExecutionContext.Provider>
  )
}

function useScraperExecution(
  targetScraperId: string,
  targetMode: ScraperMode,
  deps: DependencyList = [],
) {
  const scraperExecutionContext = useContext(ScraperExecutionContext)

  const [executionData, setExecutionData] = useState<{
    execution: AnyScraperExecutionType[]
    finished: boolean
  } | null>(null)

  useEffect(() => {
    setExecutionData(scraperExecutionContext.getExecutionData(targetScraperId, targetMode) ?? null)
  }, [scraperExecutionContext, targetMode, targetScraperId])

  useEffect(() => {
    const handleApiEvent: ScraperExecutionChangeListenerType = (scraperId, mode, executionData) => {
      if (targetScraperId === scraperId && targetMode === mode) {
        setExecutionData({ ...executionData, execution: [...executionData.execution] })
      }
    }

    scraperExecutionContext.addChangeListener(handleApiEvent)

    return () => {
      scraperExecutionContext.removeChangeListener(handleApiEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetScraperId, targetMode, ...deps])

  return executionData
}

function useScraperExecutionContext() {
  return useContext(ScraperExecutionContext)
}

export const ScraperExecutionModule = {
  Provider: ScraperExecutionProvider,
  useScraperExecutionContext,
  useScraperExecution,
}

const scraperExecutionScopeLevels: { [key in ScraperExecutionScope]: number } = {
  [ScraperExecutionScope.ACTION_STEP]: 0,
  [ScraperExecutionScope.ACTION]: 1,
  [ScraperExecutionScope.FLOW]: 2,
  [ScraperExecutionScope.PROCEDURE]: 3,
  [ScraperExecutionScope.ROUTINE]: 4,
}

function assertScraperMode(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('Scraper mode is not valid')
  }
}
