import { useContext } from 'react'
import { CancelRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import type { TestingSessionSchema } from '../../api/useTestingSessions'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { UrlButton } from '../../components/common/button/UrlButton'
import { TagsCellValue } from '../../components/table/TagsCellValue'
import { ApiContext } from '../../context/apiContext'
import { commonLayoutTransitions } from '../../layout/helpers'

export const TestingSessionsList = () => {
  const { testingSessions } = useContext(ApiContext)

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

interface TestingSessionItemProps {
  session: TestingSessionSchema
}

const TestingSessionItem = ({ session }: TestingSessionItemProps) => {
  const { testingSessions } = useContext(ApiContext)

  return (
    <Card variant="outlined" sx={{ minWidth: 275 }}>
      <CardContent>
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <UrlButton>{session.site.url}</UrlButton>
            <Typography variant="body2" color="text.secondary">
              {session.site.language}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1}>
            <TagsCellValue tags={session.site.tags} />
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <LoadingButton
          variant="text"
          color="primary"
          size="small"
          endIcon={<CancelRounded />}
          loading={
            testingSessions.endingSession &&
            testingSessions.endingSessionData?.[0] === session.sessionId
          }
          loadingPosition="end"
          onClick={() => testingSessions.endSession(session)}
        >
          End session
        </LoadingButton>
      </CardActions>
    </Card>
  )
}
