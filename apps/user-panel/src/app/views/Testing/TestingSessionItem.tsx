import { useCallback, useRef, useState } from 'react'
import { CancelRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Box, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import type { Site } from '@web-scraper/common'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { HorizontallyScrollableContainer } from '../../components/common/HorizontallyScrollableContainer'
import { TermInfo } from '../../components/common/TermInfo'
import { UrlButton } from '../../components/common/button/UrlButton'
import { OpenSiteInstructionsFormButton } from '../../components/site/OpenSiteInstructionsFormButton'
import { SiteInstructionsForm } from '../../components/siteInstructions/SiteInstructionsForm'
import { TagsCellValue } from '../../components/table/TagsCellValue'
import {
  ScraperTestingSessionsModule,
  type TestingSessionSchema,
} from '../../modules/ScraperTestingSessionsModule'

interface TestingSessionItemProps {
  session: TestingSessionSchema
}

export const TestingSessionItem = ({ session }: TestingSessionItemProps) => {
  const testingSessions = ScraperTestingSessionsModule.useTestingSessions()
  const siteInstructionsDrawerRef = useRef<CustomDrawerRef>(null)

  const [siteToShowInstructions, setSiteToShowInstructions] = useState<Site | null>(null)

  const handleShowInstructions = useCallback((site: Site) => {
    setSiteToShowInstructions(site)
    siteInstructionsDrawerRef.current?.open()
  }, [])

  const handleSiteInstructionsSet = useCallback(() => {
    setSiteToShowInstructions(null)
    siteInstructionsDrawerRef.current?.close()
  }, [])

  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack gap={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <UrlButton>{session.site.url}</UrlButton>
              <Typography variant="body2" color="text.secondary">
                {session.site.language}
              </Typography>
            </Stack>
            <HorizontallyScrollableContainer
              alignItems="center"
              justifyContent="flex-start"
              gap={1}
              maxWidth="100%"
            >
              <TagsCellValue tags={session.site.tags} />
            </HorizontallyScrollableContainer>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <OpenSiteInstructionsFormButton onClick={() => handleShowInstructions(session.site)} />
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
      <CustomDrawer
        ref={siteInstructionsDrawerRef}
        title={
          <>
            <Box component="span" mr={1}>
              Site instructions
            </Box>
            <TermInfo term="Site instructions" />
          </>
        }
      >
        {siteToShowInstructions && (
          <SiteInstructionsForm
            site={siteToShowInstructions}
            onSuccess={handleSiteInstructionsSet}
          />
        )}
      </CustomDrawer>
    </>
  )
}
