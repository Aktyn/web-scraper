import { FormInput } from "@/components/common/form/form-input"
import { FormSwitch } from "@/components/common/form/form-switch"
import { FormField, FormItem } from "@/components/shadcn/form"
import { cn } from "@/lib/utils"
import { PageActionType, type CreateScraper } from "@web-scraper/common"
import { useWatch, type Control } from "react-hook-form"
import { ScraperSelectorsForm } from "./scraper-selectors-form"
import { ScraperValueForm } from "./scraper-value-form"

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
