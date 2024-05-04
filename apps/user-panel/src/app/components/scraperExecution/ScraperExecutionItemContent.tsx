import { Fragment, useEffect, useRef } from 'react'
import {
  CircleRounded,
  CodeRounded,
  ErrorRounded,
  FormatListBulletedRounded,
  LabelRounded,
  LinkRounded,
} from '@mui/icons-material'
import { Stack } from '@mui/material'
import { ActionStepErrorType, ScraperExecutionScope } from '@web-scraper/common'
import {
  actionStepErrorTypeNames,
  actionStepTypeNames,
  procedureTypeNames,
} from 'src/app/utils/dictionaries'
import type { ParsedScraperExecution } from './helpers'
import { ReadonlyField } from '../common/input/ReadonlyField'

interface ScraperExecutionItemContentProps {
  item: ParsedScraperExecution
}

export const ScraperExecutionItemContent = ({ item }: ScraperExecutionItemContentProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 200)
  }, [])

  const start = item.start

  return (
    <Stack ref={containerRef} width="100%">
      {start.scope === ScraperExecutionScope.PROCEDURE && (
        <>
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
        <ReadonlyField
          label="Action name"
          value={start.flow.actionName}
          icon={<FormatListBulletedRounded />}
        />
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
