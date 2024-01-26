import { useCallback, useMemo, useRef, useState } from 'react'
import { CodeRounded, LabelRounded, LinkRounded } from '@mui/icons-material'
import { Box, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material'
import {
  GLOBAL_ACTION_PREFIX,
  REGULAR_ACTION_PREFIX,
  isFinishGlobalAction,
  type GlobalActionType,
  type Procedure,
  type Site,
  type SiteProcedures,
} from '@web-scraper/common'
import { noop } from '../../utils'
import { globalActionTypeNames, procedureTypeNames } from '../../utils/dictionaries'
import { CustomDrawer, type CustomDrawerRef } from '../common/CustomDrawer'
import { TermInfo } from '../common/TermInfo'
import { UrlButton } from '../common/button/UrlButton'
import { TermChip } from '../common/chip/TermChip'
import { ReadonlyField } from '../common/input/ReadonlyField'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { OpenSiteInstructionsFormButtonWithBadge } from '../site/OpenSiteInstructionsFormButton'
import { SiteInstructionsForm } from '../siteInstructions/SiteInstructionsForm'

interface ProcedureWidgetProps {
  procedure: Procedure
  groupedSiteProcedures: SiteProcedures[]
}

export const ProcedureWidget = ({ procedure, groupedSiteProcedures }: ProcedureWidgetProps) => {
  const siteInstructionsDrawerRef = useRef<CustomDrawerRef>(null)

  const [siteToShowInstructions, setSiteToShowInstructions] = useState<Site | null>(null)

  const site = useMemo(() => {
    const group = groupedSiteProcedures.find((group) =>
      group.procedures.some(({ id }) => id === procedure.id),
    )
    return group?.site
  }, [groupedSiteProcedures, procedure.id])

  const handleShowInstructions = useCallback(() => {
    if (!site) {
      return
    }
    setSiteToShowInstructions(site)
    siteInstructionsDrawerRef.current?.open()
  }, [site])

  return (
    <>
      <Paper
        variant="elevation"
        elevation={2}
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          flexDirection: 'column',
          rowGap: '0.5rem',
          p: '1rem',
          color: 'text.primary',
          minWidth: '16.5rem',
          width: 'auto',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            alignItems: 'center',
            columnGap: '1rem',
          }}
        >
          <Stack>
            <Typography
              variant="body1"
              fontWeight="bold"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {procedure.name}
            </Typography>
            {site ? (
              <UrlButton variant="caption" color="text.secondary">
                {site.url}
              </UrlButton>
            ) : (
              <LinearProgress />
            )}
          </Stack>
          <TermChip term="procedure" />
          {site ? (
            <OpenSiteInstructionsFormButtonWithBadge site={site} onClick={handleShowInstructions} />
          ) : (
            <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
          )}
        </Box>
        <ReadonlyField
          label="Type"
          value={procedureTypeNames[procedure.type]}
          showBorder
          icon={<LabelRounded />}
        />
        <ReadonlyField
          label="Start URL"
          value={procedure.startUrl}
          showBorder
          icon={<LinkRounded />}
        />
        <ReadonlyField
          label="Wait for"
          value={procedure.waitFor ?? ''}
          showBorder
          icon={<CodeRounded />}
        />
        <Box mx="-1rem">
          <FlowBranch flow={procedure.flow} />
        </Box>
      </Paper>
      <CustomDrawer
        ref={siteInstructionsDrawerRef}
        title={
          <>
            <Box component="span" mr="0.5rem">
              Site instructions
            </Box>
            <TermInfo term="siteInstructions" />
          </>
        }
      >
        {siteToShowInstructions && (
          <SiteInstructionsForm site={siteToShowInstructions} onSuccess={noop} />
        )}
      </CustomDrawer>
    </>
  )
}

interface FlowBranchProps {
  flow: Procedure['flow']
  title?: string
  level?: number
  disabled?: boolean
}

const FlowBranch = ({ flow, title = 'Flow', level = 0, disabled }: FlowBranchProps) => {
  const items = useMemo(() => (flow ? [flow] : []), [flow])

  const [prefix, actionName] = flow?.actionName?.split('.') ?? ['', '']

  return (
    <ItemsList
      title={
        title === 'Flow' ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing="0.5rem"
            mr="1rem"
            color="text.secondary"
          >
            <ItemTitle>{title}</ItemTitle>
            <TermInfo term="flowStep" sx={{ pointerEvents: 'all' }} />
          </Stack>
        ) : (
          title
        )
      }
      items={items}
      level={level}
      disabled={disabled}
    >
      {(flowStep, index) => [
        index,
        <Stack key={flowStep.id} gap="1rem" minWidth="12rem">
          <ReadonlyField
            label="Action name"
            value={`${
              prefix === GLOBAL_ACTION_PREFIX
                ? 'Global'
                : prefix === REGULAR_ACTION_PREFIX
                  ? 'Action'
                  : '-'
            }.${
              prefix === GLOBAL_ACTION_PREFIX
                ? globalActionTypeNames[actionName as GlobalActionType]
                : actionName
            }`}
            showBorder
            icon={<LabelRounded />}
          />
          {prefix === GLOBAL_ACTION_PREFIX && flowStep.globalReturnValues.length > 0 && (
            <GlobalReturnValuesList
              level={level + 1}
              globalReturnValues={flowStep.globalReturnValues}
            />
          )}
          {!isFinishGlobalAction(flowStep.actionName) && (
            <>
              <FlowBranch flow={flowStep.onSuccess} title="On success" level={level + 1} />
              <FlowBranch flow={flowStep.onFailure} title="On failure" level={level + 1} />
            </>
          )}
        </Stack>,
      ]}
    </ItemsList>
  )
}

interface GlobalReturnValuesListProps {
  globalReturnValues: string[]
  level: number
}

const GlobalReturnValuesList = ({ globalReturnValues, level }: GlobalReturnValuesListProps) => {
  return (
    <ItemsList title="Global return values" items={globalReturnValues} level={level}>
      {(value, index) => [
        index,
        <ReadonlyField
          key={index}
          label="Wait for"
          value={value ?? ''}
          showBorder
          icon={<CodeRounded />}
        />,
      ]}
    </ItemsList>
  )
}
