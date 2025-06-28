import { FormInput } from "@/components/common/form/form-input"
import { FormSwitch } from "@/components/common/form/form-switch"
import { FormField, FormItem } from "@/components/shadcn/form"
import { cn } from "@/lib/utils"
import { PageActionType, type CreateScraper } from "@web-scraper/common"
import { useWatch, type Control } from "react-hook-form"
import { EvaluatorField } from "../common/evaluator-field"
import { ScraperSelectorsForm } from "./scraper-selectors-form"
import { ScraperValueForm } from "./scraper-value-form"
import { AvailabilityCheck } from "@/components/common/availability-check"
import { FormTextarea } from "@/components/common/form/form-textarea"

export type PageActionFieldName = `instructions.${number}.action`

type PageActionFormProps = {
  control: Control<CreateScraper>
  fieldName: PageActionFieldName
}

export function PageActionForm({ control, fieldName }: PageActionFormProps) {
  const actionType = useWatch({ control, name: `${fieldName}.type` })

  switch (actionType) {
    case PageActionType.Navigate:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.url`}
          label="URL"
          placeholder="https://example.com"
          description="The URL to navigate to"
        />
      )

    case PageActionType.Wait:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.duration`}
          label="Duration (ms)"
          type="number"
          placeholder="1000"
          description="Wait duration in milliseconds"
        />
      )

    case PageActionType.Click:
      return (
        <div className="space-y-4">
          <SelectorFields
            control={control}
            fieldName={`${fieldName}.selectors`}
          />
          <ClickActionSwitches control={control} fieldName={fieldName} />
        </div>
      )

    case PageActionType.SmartClick:
      return (
        <div className="space-y-4">
          <AvailabilityCheck feature={AvailabilityCheck.Feature.SmartClick} />
          <FormInput
            control={control}
            name={`${fieldName}.aiPrompt`}
            label="AI prompt"
            description="Prompt to the AI to localize the element to click on"
          />
          <ClickActionSwitches control={control} fieldName={fieldName} />
        </div>
      )

    case PageActionType.Type:
      return (
        <div className="space-y-4">
          <SelectorFields
            control={control}
            fieldName={`${fieldName}.selectors`}
          />

          <div>
            <h5 className="font-medium mb-2">Value to type</h5>
            <ScraperValueForm
              control={control}
              fieldName={`${fieldName}.value`}
            />
          </div>

          <FormSwitch
            control={control}
            name={`${fieldName}.clearBeforeType`}
            label="Clear before typing"
            description="Clear the input field before typing"
          />
          <FormSwitch
            control={control}
            name={`${fieldName}.pressEnter`}
            label="Press enter"
            description="Press enter after typing"
          />
          <FormSwitch
            control={control}
            name={`${fieldName}.waitForNavigation`}
            label="Wait for navigation"
            description="Wait for navigation after typing and pressing enter"
          />
        </div>
      )

    case PageActionType.ScrollToTop:
    case PageActionType.ScrollToBottom:
      return null

    case PageActionType.ScrollToElement:
      return (
        <SelectorFields
          control={control}
          fieldName={`${fieldName}.selectors`}
        />
      )

    case PageActionType.Evaluate:
      return (
        <EvaluatorField
          control={control}
          fieldName={`${fieldName}.evaluator`}
        />
      )

    case PageActionType.RunAutonomousAgent:
      return (
        <div className="space-y-4">
          <FormTextarea
            control={control}
            name={`${fieldName}.task`}
            label="Task"
            description="Task to perform"
          />
          <FormInput
            control={control}
            name={`${fieldName}.startUrl`}
            label="Start URL"
            description="URL to start the agent from (optional)"
          />
          <FormInput
            control={control}
            name={`${fieldName}.maximumSteps`}
            label="Maximum steps"
            description="Maximum allowed number of steps that the agent can take before giving up"
            type="number"
          />
          <FormSwitch
            control={control}
            name={`${fieldName}.useGhostCursor`}
            label="Use ghost cursor"
            description="Use a ghost cursor to click the element in user-like way"
          />
        </div>
      )
  }
}

type SelectorFieldsProps = {
  control: Control<CreateScraper>
  fieldName: `${PageActionFieldName}.selectors`
}

function SelectorFields({ control, fieldName }: SelectorFieldsProps) {
  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ fieldState }) => (
        <FormItem className="block">
          <h5
            className={cn(
              "font-medium mb-2",
              fieldState.error && "text-destructive",
            )}
          >
            Element selectors:
          </h5>
          <ScraperSelectorsForm control={control} fieldName={fieldName} />
          {fieldState.error && (
            <p data-slot="form-message" className="text-destructive text-sm">
              {fieldState.error.message ?? fieldState.error.root?.message}
            </p>
          )}
        </FormItem>
      )}
    />
  )
}

type ClickActionSwitchesProps = {
  control: Control<CreateScraper>
  fieldName: PageActionFieldName
}

function ClickActionSwitches({ control, fieldName }: ClickActionSwitchesProps) {
  return (
    <>
      <FormSwitch
        control={control}
        name={`${fieldName}.waitForNavigation`}
        label="Wait for navigation"
        description="Wait for navigation after clicking"
      />
      <FormSwitch
        control={control}
        name={`${fieldName}.useGhostCursor`}
        label="Use ghost cursor"
        description="Use a ghost cursor to click the element in user-like way"
      />
    </>
  )
}
