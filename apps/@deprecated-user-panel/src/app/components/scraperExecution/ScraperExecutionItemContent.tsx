import { Fragment, useEffect, useRef } from 'react'
import {
  CircleRounded,
  CodeRounded,
  DataObjectRounded,
  ErrorRounded,
  FormatListBulletedRounded,
  LabelRounded,
  LinkRounded,
} from '@mui/icons-material'
import { Stack } from '@mui/material'
import { ActionStepErrorType, ScraperExecutionScope } from '@web-scraper/common'
import type { ParsedScraperExecution } from './helpers'
import {
  actionStepErrorTypeNames,
  actionStepTypeNames,
  parseActionName,
  procedureTypeNames,
  routineExecutionTypeNames,
} from '../../utils/dictionaries'
import { JsonValue } from '../common/JsonValue'
import { ReadonlyField } from '../common/input/ReadonlyField'

interface ScraperExecutionItemContentProps {
  item: ParsedScraperExecution
  autoScroll?: boolean
}

export const ScraperExecutionItemContent = ({
  item,
  autoScroll = true,
}: ScraperExecutionItemContentProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!autoScroll) {
      return
    }
    const timeout = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [autoScroll])

  const start = item.start

  return (
    <Stack ref={containerRef} width="100%" minWidth="14rem">
      {start.scope === ScraperExecutionScope.ROUTINE && (
        <>
          <ReadonlyField label="Name" value={start.routine.name} icon={<LabelRounded />} />
          <ReadonlyField label="Iteration" value={start.iterationIndex} icon={<LabelRounded />} />
          <ReadonlyField
            label="Execution plan"
            value={routineExecutionTypeNames[start.routine.executionPlan.type]}
            icon={<FormatListBulletedRounded />}
          />
        </>
      )}
      {start.scope === ScraperExecutionScope.PROCEDURE && (
        <>
          <ReadonlyField label="Name" value={start.procedure.name} icon={<LabelRounded />} />
          <ReadonlyField
            label="Type"
            value={procedureTypeNames[start.procedure.type]}
            icon={<FormatListBulletedRounded />}
          />
          <ReadonlyField
            label="Start URL"
            value={start.procedure.startUrl}
            icon={<LinkRounded />}
          />
          {start.procedure.waitFor && (
            <ReadonlyField
              label="Wait for"
              value={start.procedure.waitFor}
              icon={<CodeRounded />}
            />
          )}
        </>
      )}
      {start.scope === ScraperExecutionScope.FLOW && (
        <>
          <ReadonlyField
            label="Action name"
            value={parseActionName(start.flow.actionName)}
            icon={<FormatListBulletedRounded />}
          />
          {start.flow.onSuccess && (
            <ReadonlyField
              label="On success"
              value={parseActionName(start.flow.onSuccess.actionName)}
              icon={<FormatListBulletedRounded />}
            />
          )}
          {start.flow.onFailure && (
            <ReadonlyField
              label="On failure"
              value={parseActionName(start.flow.onFailure.actionName)}
              icon={<FormatListBulletedRounded />}
            />
          )}
        </>
      )}
      {start.scope === ScraperExecutionScope.ACTION && (
        <>
          <ReadonlyField label="Name" value={start.action.name} icon={<LabelRounded />} />
          {start.action.url && (
            <ReadonlyField label="URL" value={start.action.url} icon={<LinkRounded />} />
          )}
        </>
      )}
      {start.scope === ScraperExecutionScope.ACTION_STEP && (
        <>
          <ReadonlyField
            label="Type"
            value={actionStepTypeNames[start.actionStep.type]}
            icon={<FormatListBulletedRounded />}
          />
          <ReadonlyField
            label="Data (as JSON)"
            value=""
            icon={
              <Stack direction="row" alignItems="center" gap="0.5rem">
                <DataObjectRounded />
                <JsonValue>{JSON.stringify(start.actionStep.data)}</JsonValue>
              </Stack>
            }
          />
        </>
      )}

      {item.result?.scope === ScraperExecutionScope.FLOW &&
        item.result.flowResult.map((flowResult, index) =>
          flowResult.returnedValues.length > 0 ? (
            <Fragment key={index}>
              {flowResult.returnedValues.map((returnedValue, index2) => (
                <ReadonlyField
                  key={index2}
                  label="Returned value"
                  value={typeof returnedValue === 'string' ? returnedValue : returnedValue.error}
                  icon={<CircleRounded />}
                />
              ))}
            </Fragment>
          ) : null,
        )}
      {item.result?.scope === ScraperExecutionScope.ACTION_STEP &&
        item.result.actionStepResult.errorType !== ActionStepErrorType.NO_ERROR && (
          <ReadonlyField
            label="Action error"
            value={actionStepErrorTypeNames[item.result.actionStepResult.errorType]}
            icon={<ErrorRounded color="error" />}
            error
          />
        )}
    </Stack>
  )
}
