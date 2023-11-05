import { useEffect } from 'react'
import { Stack, Typography } from '@mui/material'
import { TestingSessionItem } from './TestingSessionItem'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { commonLayoutTransitions } from '../../layout/helpers'
import { ScraperTestingSessionsModule } from '../../modules/ScraperTestingSessionsModule'

export const TestingSessionsList = () => {
  const testingSessions = ScraperTestingSessionsModule.useTestingSessions()

  const { loadDataSources, dataSources } = useDataSourcesLoader()

  useEffect(() => {
    void loadDataSources()
  }, [loadDataSources])

  return (
    <Stack height="100%" alignItems="center" gap="1rem">
      <ViewTransition type={TransitionType.MOVE_TOP}>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            transform: 'translateY(-100vh)',
            position: 'sticky',
            zIndex: 2,
            top: 0,
            backgroundColor: (theme) => theme.palette.background.default,
            transition: commonLayoutTransitions.backgroundColor,
            px: 2,
            pt: 2,
          }}
        >
          Site instructions testing sessions
        </Typography>
      </ViewTransition>
      <Stack
        className="testing-section"
        flexGrow={1}
        alignItems="stretch"
        p="1rem"
        pt={0}
        gap="0.5rem"
        mx="auto"
      >
        <DataSourcesContext.Provider value={dataSources ?? emptyArray}>
          {testingSessions.sessions.length > 0 ? (
            testingSessions.sessions.map((session) => (
              <TestingSessionItem key={session.sessionId} session={session} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active sessions
            </Typography>
          )}
        </DataSourcesContext.Provider>
      </Stack>
    </Stack>
  )
}

const emptyArray = [] as never
