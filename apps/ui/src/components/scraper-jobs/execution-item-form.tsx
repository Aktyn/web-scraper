import { yupResolver } from '@hookform/resolvers/yup'
import { mdiAlert, mdiPencilBox, mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import {
  ExecutionItemType,
  upsertJobExecutionItemSchema,
  upsertScraperStepSchema,
  type JobExecutionItem,
  type UpsertJobExecutionItemSchema,
} from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { cn } from '~/lib/utils'
import { FormInput } from '../common/form/form-input'
import { Button } from '../ui/button'
import { Form } from '../ui/form'

type ExecutionItemFormProps = {
  item: ExecutionItemType | JobExecutionItem
  onSubmitSuccess: (executionItem: UpsertJobExecutionItemSchema) => void
  maxTargetExecutionItemIndex: number
  className?: string
}

export function ExecutionItemForm({
  item,
  onSubmitSuccess,
  maxTargetExecutionItemIndex,
  className,
}: ExecutionItemFormProps) {
  const editMode = typeof item !== 'string'
  const type = editMode ? item.type : item

  const form = useForm<UpsertJobExecutionItemSchema>({
    resolver: yupResolver(upsertJobExecutionItemSchema),
    defaultValues:
      typeof item === 'string'
        ? {
            type,
            condition:
              type === ExecutionItemType.CONDITION
                ? {
                    condition: {},
                    flowAction: { type: 'jump', targetExecutionItemIndex: 0 },
                  }
                : undefined,
            step:
              type === ExecutionItemType.STEP ? upsertScraperStepSchema.getDefault() : undefined,
          }
        : item,
  })

  return (
    <Form {...form}>
      <form
        id="execution-item-form"
        onSubmit={(event) => {
          event.stopPropagation()
          event.preventDefault()
          void form.handleSubmit(onSubmitSuccess, console.error)(event)
        }}
        className={cn('flex flex-col gap-y-4 items-start', className)}
      >
        <div className="flex flex-row flex-wrap items-stretch gap-2">
          {type === ExecutionItemType.STEP && <div>TODO: action step fields</div>}
          {type === ExecutionItemType.CONDITION && (
            <>
              {/* TODO: use FormSelect component */}
              <FormInput
                control={form.control}
                name="condition.flowAction.type"
                label="Flow action type"
                inputProps={{ readOnly: true }}
              />
              {maxTargetExecutionItemIndex >= 0 ? (
                <FormInput
                  control={form.control}
                  name="condition.flowAction.targetExecutionItemIndex"
                  label="Target execution item index"
                  inputProps={{ type: 'number', min: 0, max: maxTargetExecutionItemIndex }}
                />
              ) : (
                <div className="text-warning text-balance">
                  <Icon path={mdiAlert} className="size-6 inline align-top" /> There is at least one
                  execution item required for this type of flow action.
                </div>
              )}
            </>
          )}
          {/* 
          <FormField
            control={form.control}
            name="execution"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Execution</FormLabel>
                <ExecutionForm {...field} />
                <FormMessage reserveSpace className="!mt-auto" />
              </FormItem>
            )}
          /> */}
        </div>
        <Button
          form="execution-item-form"
          size="default"
          variant="default"
          type="submit"
          disabled={form.formState.isSubmitted && !form.formState.isValid}
          className="ml-auto"
        >
          <Icon path={editMode ? mdiPencilBox : mdiPlus} />
          {editMode ? 'Update' : 'Add'}
        </Button>
      </form>
    </Form>
  )
}
