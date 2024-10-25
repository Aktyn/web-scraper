import { mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import type { UpsertScraperJobSchema } from '@web-scraper/common'
import { forwardRef } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { Button } from '../ui/button'
import { AddExecutionItemDropdown } from './add-execution-item-dropdown'
import { ExecutionFlow } from './execution-flow'

type ExecutionFormProps = ControllerRenderProps<UpsertScraperJobSchema, 'execution'>

export const ExecutionForm = forwardRef<HTMLDivElement, ExecutionFormProps>(
  ({ value: execution, onChange, disabled }, ref) => {
    return (
      <div ref={ref} className="flex flex-row flex-wrap items-center justify-start gap-4">
        {execution.length > 0 && <ExecutionFlow execution={execution} onChange={onChange} />}
        <AddExecutionItemDropdown execution={execution} onChange={onChange}>
          <Button variant="secondary" disabled={disabled}>
            <Icon path={mdiPlus} />
            Add execution item
          </Button>
        </AddExecutionItemDropdown>
      </div>
    )
  },
)

ExecutionForm.displayName = 'ExecutionForm'
