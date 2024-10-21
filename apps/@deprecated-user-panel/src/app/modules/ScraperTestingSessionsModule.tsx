import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  type ActionStep,
  type DataSourceValueQuery,
  ElectronToRendererMessage,
  type Site,
  type ValueQuery,
} from '@web-scraper/common'
import { ApiModule } from './ApiModule'
import { DataSourceItemForActionStepDialog } from '../components/siteInstructions/DataSourceItemForActionStepDialog'
import { ManualDataForActionStepDialog } from '../components/siteInstructions/ManualDataForActionStepDialog'
import { useApiRequest } from '../hooks/useApiRequest'

export interface TestingSessionSchema {
  sessionId: string
  site: Site
}

const ScraperTestingSessionsContext = createContext([] as TestingSessionSchema[])

function ScraperTestingSessionsProvider({ children }: PropsWithChildren) {
  const { submit: getSiteInstructionsTestingSessions } = useApiRequest(
    window.electronAPI.getSiteInstructionsTestingSessions,
  )

  const [sessions, setSessions] = useState<TestingSessionSchema[]>([])
  const [manualDataForActionStepResponseQueue, setManualDataForActionStepResponseQueue] = useState<
    {
      requestId: string
      actionStep: ActionStep
      valueQuery: ValueQuery
    }[]
  >([])
  const [
    dataSourceItemIdForActionStepResponseQueue,
    setDataSourceItemIdForActionStepResponseQueue,
  ] = useState<
    {
      requestId: string
      actionStep: ActionStep
      dataSourceQuery: DataSourceValueQuery
    }[]
  >([])

  ApiModule.useEvent(
    ElectronToRendererMessage.siteInstructionsTestingSessionOpen,
    (_, sessionId, site) => {
      setSessions((sessions) => [...sessions, { sessionId, site }])
    },
  )
  ApiModule.useEvent(
    ElectronToRendererMessage.siteInstructionsTestingSessionClosed,
    (_, sessionId) => {
      setSessions((sessions) => sessions.filter((session) => session.sessionId !== sessionId))
    },
  )
  ApiModule.useEvent(
    ElectronToRendererMessage.requestManualDataForActionStep,
    (_, requestId, actionStep, valueQuery) => {
      setManualDataForActionStepResponseQueue((queue) => [
        ...queue,
        { requestId, actionStep, valueQuery },
      ])
    },
  )
  ApiModule.useEvent(
    ElectronToRendererMessage.requestDataSourceItemIdForActionStep,
    (_, requestId, actionStep, dataSourceQuery) => {
      setDataSourceItemIdForActionStepResponseQueue((queue) => [
        ...queue,
        { requestId, actionStep, dataSourceQuery },
      ])
    },
  )

  useEffect(() => {
    getSiteInstructionsTestingSessions({
      onSuccess: setSessions,
    })
  }, [getSiteInstructionsTestingSessions])

  return (
    <ScraperTestingSessionsContext.Provider value={sessions}>
      {children}
      <ManualDataForActionStepDialog
        open={manualDataForActionStepResponseQueue.length > 0}
        data={manualDataForActionStepResponseQueue.at(0)}
        onResponseSent={(handledData) =>
          setManualDataForActionStepResponseQueue((queue) =>
            queue.filter((item) => item !== handledData),
          )
        }
      />
      <DataSourceItemForActionStepDialog
        open={dataSourceItemIdForActionStepResponseQueue.length > 0}
        data={dataSourceItemIdForActionStepResponseQueue.at(0)}
        onResponseSent={(handledData) =>
          setDataSourceItemIdForActionStepResponseQueue((queue) =>
            queue.filter((item) => item !== handledData),
          )
        }
      />
    </ScraperTestingSessionsContext.Provider>
  )
}

function useTestingSessions() {
  const testingSessions = useContext(ScraperTestingSessionsContext)

  const {
    submit: startSiteInstructionsTestingSession,
    submitting: startingSession,
    submittingData: startingSessionData,
  } = useApiRequest(window.electronAPI.startSiteInstructionsTestingSession)
  const {
    submit: endSiteInstructionsTestingSession,
    submitting: endingSession,
    submittingData: endingSessionData,
  } = useApiRequest(window.electronAPI.endSiteInstructionsTestingSession)
  const startSession = useCallback(
    (siteId: Site['id']) => {
      startSiteInstructionsTestingSession(
        {
          onSuccess: (data, { enqueueSnackbar }) => {
            enqueueSnackbar({
              variant: 'success',
              message: 'Site instructions testing session started',
            })
          },
        },
        siteId,
      )
    },
    [startSiteInstructionsTestingSession],
  )

  const endSession = useCallback(
    (session: TestingSessionSchema | string) => {
      endSiteInstructionsTestingSession(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({
              variant: 'success',
              message: 'Site instructions testing session ended',
            })
          },
        },
        typeof session === 'string' ? session : session.sessionId,
      )
    },
    [endSiteInstructionsTestingSession],
  )

  return useMemo(
    () => ({
      startSession,
      endSession,
      sessions: testingSessions,
      startingSession,
      startingSessionData,
      endingSession,
      endingSessionData,
    }),
    [
      endSession,
      endingSession,
      endingSessionData,
      startSession,
      startingSession,
      startingSessionData,
      testingSessions,
    ],
  )
}

export const ScraperTestingSessionsModule = {
  Provider: ScraperTestingSessionsProvider,
  useTestingSessions,
}
