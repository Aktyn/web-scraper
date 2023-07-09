import { Stack, Typography } from '@mui/material'
import { TestingSessionItem } from './TestingSessionItem'
import { ScraperTestingSessionsModule } from '../../api/ScraperTestingSessionsModule'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { commonLayoutTransitions } from '../../layout/helpers'

export const TestingSessionsList = () => {
  const testingSessions = ScraperTestingSessionsModule.useTestingSessions()

  return (
    <Stack alignItems="center" gap={2}>
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
      <Stack className="testing-section" alignItems="stretch" p={2} pt={0} gap={1} mx="auto">
        {testingSessions.sessions.length > 0 ? (
          testingSessions.sessions.map((session) => (
            <TestingSessionItem key={session.sessionId} session={session} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No active sessions
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}
