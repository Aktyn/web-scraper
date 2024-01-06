import { useMemo } from 'react'
import { CodeRounded, LabelRounded, LinkRounded } from '@mui/icons-material'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import {
  GLOBAL_ACTION_PREFIX,
  REGULAR_ACTION_PREFIX,
  type GlobalActionType,
  type Procedure,
  isFinishGlobalAction,
} from '@web-scraper/common'
import { globalActionTypeNames, procedureTypeNames } from '../../utils/dictionaries'
import { TermInfo } from '../common/TermInfo'
import { ReadonlyField } from '../common/input/ReadonlyField'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'

interface ProcedureWidgetProps {
  procedure: Procedure
}

export const ProcedureWidget = ({ procedure }: ProcedureWidgetProps) => {
  return (
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
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          columnGap: '1rem',
        }}
      >
        <Typography
          variant="body1"
          fontWeight="bold"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
        >
          {procedure.name}
        </Typography>
        <Chip
          label={
            <Stack direction="row" alignItems="center" gap="0.5rem">
              Procedure <TermInfo term="Procedure" sx={{ pointerEvents: 'all' }} />
            </Stack>
          }
          variant="outlined"
          size="small"
          color="primary"
        />
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
            <TermInfo term="Flow step" sx={{ pointerEvents: 'all' }} />
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
