import { AlertCircle, PenBox, Plus } from 'lucide-react'
import {
  ExecutionItemType,
  FlowActionType,
  ScraperStepType,
  upsertExecutionConditionSchema,
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
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

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

  const form = useForm<UpsertJobExecutionItemSchema>({
    resolver: zodResolver(upsertJobExecutionItemSchema),
    defaultValues:
      typeof item === 'string'
        ? upsertJobExecutionItemSchema.parse({
            type: item,
            condition:
              item === ExecutionItemType.CONDITION
                ? upsertExecutionConditionSchema.parse({})
                : undefined,
            step: item === ExecutionItemType.STEP ? upsertScraperStepSchema.parse({}) : undefined,
            // aiAction: item === ExecutionItemType.AI_ACTION ? {} : undefined,
          })
        : // ? {
          //     type,
          //     condition:
          //       type === ExecutionItemType.CONDITION
          //         ? {
          //             condition: {},
          //             flowAction: { type: FlowActionType.JUMP, targetExecutionItemIndex: 0 },
          //           }
          //         : undefined,
          //     step: type === ExecutionItemType.STEP ? upsertScraperStepSchema.parse({}) : undefined,
          //     aiAction:
          //       type === ExecutionItemType.AI_ACTION
          //         ? {
          //             prompt: '',
          //           }
          //         : undefined,
          //   }
          item,
  })

  const type = form.watch('type')

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
        <div className="flex flex-row flex-wrap items-stretch justify-start gap-4 w-full">
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
                  <AlertCircle className="size-6 inline align-top" /> There is at least one
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
              <ActionStepDataFields
                control={form.control}
                //TODO
                defaultUseAI={false}
                // defaultUseAI={
                //   editMode &&
                //   item.type === ExecutionItemType.STEP &&
                //   item.step.type !== ScraperStepType.REDIRECT &&
                //   typeof item.step.data.element === 'object' &&
                //   item.step.data.element !== null
                // }
              />
            </>
          )}
          {/* {type === ExecutionItemType.AI_ACTION && (
            <FormTextArea
              className="w-full"
              control={form.control}
              name="aiAction.prompt"
              label="AI action prompt. Supports value queries."
              placeholder="E.g., 'Login with username {{users.login}} and password {{users.password}}'"
            />
          )} */}
          {/* 
          <FormField
            control={form.control}
            name="execution"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-start">
                <FormLabel>Execution</FormLabel>
                <ExecutionForm {...field} />
                <FormMessage reserveSpace className="mt-auto!" />
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
          className="w-full"
        >
          {editMode ? <PenBox className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{editMode ? 'Update' : 'Add'}</span>
        </Button>
      </form>
    </Form>
  )
}

type ActionStepDataFieldsProps = {
  control: Control<UpsertJobExecutionItemSchema>
  defaultUseAI: boolean
}

function ActionStepDataFields({ control, defaultUseAI }: ActionStepDataFieldsProps) {
  const { watch } = useFormContext<UpsertJobExecutionItemSchema>()
  const scraperStepType = watch('step.type')
  const pressEnter = watch('step.data.pressEnter')
  const waitForNavigation = watch('step.data.waitForNavigation')

  const [useAI, setUseAI] = useState(defaultUseAI)

  if (scraperStepType === ScraperStepType.REDIRECT) {
    return <FormInput key="url" control={control} name="step.data.url" label="Redirect URL" />
  }

  return (
    <>
      {useAI ? (
        // TODO: add ability to test-run AI prompt in active puppeteer instance
        <FormInput
          key="aiPrompt"
          control={control}
          name="step.data.element.aiPrompt"
          label="Element description for AI"
          placeholder="E.g., 'Search input', 'Login button'"
        />
      ) : (
        <FormInput key="element" control={control} name="step.data.element" label="Element path" />
      )}
      <div className="flex items-center space-x-2">
        <Switch id="ai-prompt" checked={useAI} onCheckedChange={setUseAI} />
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
