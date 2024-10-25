import { yupResolver } from '@hookform/resolvers/yup'
import { mdiAlert, mdiPencilBox, mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import {
  ExecutionItemType,
  FlowActionType,
  ScraperStepType,
  upsertJobExecutionItemSchema,
  upsertScraperStepSchema,
  type JobExecutionItem,
  type UpsertJobExecutionItemSchema,
} from '@web-scraper/common'
import { useForm, useFormContext, type Control } from 'react-hook-form'
import { flowActionTypeNames, scraperStepTypeNames } from '~/lib/dictionaries'
import { cn } from '~/lib/utils'
import { FormInput } from '../common/form/form-input'
import { FormSelect } from '../common/form/form-select'
import { FormSwitch } from '../common/form/form-switch'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

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
                    flowAction: { type: FlowActionType.JUMP, targetExecutionItemIndex: 0 },
                  }
                : undefined,
            step:
              type === ExecutionItemType.STEP
                ? {
                    ...upsertScraperStepSchema.getDefault(),
                    data: {
                      ...upsertScraperStepSchema.getDefault().data,
                      element: '',
                    },
                  }
                : undefined,
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
        <div className="flex flex-row flex-wrap items-stretch gap-y-2 gap-x-4">
          {type === ExecutionItemType.CONDITION && (
            <>
              <FormSelect
                control={form.control}
                name="condition.flowAction.type"
                label="Flow action type"
                selectProps={{ disabled: true }}
                items={flowActionTypeItems}
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
          {type === ExecutionItemType.STEP && (
            <>
              <div className="w-full flex flex-row justify-start">
                <FormSelect
                  control={form.control}
                  name="step.type"
                  label="Step type"
                  items={scraperStepTypeItems}
                  className="min-w-48"
                />
              </div>
              <ActionStepDataFields control={form.control} />
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

function ActionStepDataFields({ control }: { control: Control<UpsertJobExecutionItemSchema> }) {
  const { watch } = useFormContext<UpsertJobExecutionItemSchema>()
  const scraperStepType = watch('step.type')
  const pressEnter = watch('step.data.pressEnter')
  const waitForNavigation = watch('step.data.waitForNavigation')

  return (
    <>
      <FormInput control={control} name="step.data.element" label="Element path" />
      <div className="flex items-center space-x-2">
        <Switch id="ai-prompt" disabled />
        <Label htmlFor="ai-prompt">Use AI for targeting element</Label>
      </div>
      <FormInput control={control} name="step.data.valueQuery" label="Value query" />
      {scraperStepType === ScraperStepType.FILL_INPUT && (
        <>
          <FormSwitch control={control} name="step.data.pressEnter" label="Press enter" />
          <FormInput
            control={control}
            name="step.data.delayEnter"
            label="Delay enter"
            inputProps={{ type: 'number', min: 0 }}
            disabled={!pressEnter}
          />
        </>
      )}
      {[ScraperStepType.FILL_INPUT, ScraperStepType.PRESS_BUTTON].includes(scraperStepType) && (
        <>
          <FormSwitch
            control={control}
            name="step.data.waitForNavigation"
            label="Wait for navigation"
          />
          <FormInput
            control={control}
            name="step.data.waitForNavigationTimeout"
            label="Wait for navigation timeout (ms)"
            inputProps={{ type: 'number', min: 0 }}
            disabled={!waitForNavigation}
          />
        </>
      )}
      <FormInput
        control={control}
        name="step.data.waitForElementTimeout"
        label="Wait for element timeout (ms)"
        inputProps={{ type: 'number', min: 0 }}
      />
    </>
  )
}

const flowActionTypeItems = Object.values(FlowActionType).map((type) => ({
  value: type,
  label: flowActionTypeNames[type],
}))

const scraperStepTypeItems = Object.values(ScraperStepType).map((type) => ({
  value: type,
  label: scraperStepTypeNames[type],
}))
