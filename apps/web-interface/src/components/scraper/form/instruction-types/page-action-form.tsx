import { FormInput } from "@/components/common/form/form-input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Switch } from "@/components/shadcn/switch"
import { PageActionType, type CreateScraper } from "@web-scraper/common"
import { useFormContext, type Control } from "react-hook-form"
import { ScraperSelectorForm } from "./scraper-selector-form"
import { ScraperValueForm } from "./scraper-value-form"

export type PageActionFieldName = `instructions.${number}.action`

interface PageActionFormProps {
  control: Control<CreateScraper>
  fieldName: PageActionFieldName
}

export function PageActionForm({ control, fieldName }: PageActionFormProps) {
  const { watch } = useFormContext<CreateScraper>()
  const actionType = watch(`${fieldName}.type`)

  switch (actionType) {
    case PageActionType.Navigate:
      return (
        <FormInput
          control={control}
          name={`${fieldName}.url`}
          label="URL"
          placeholder="https://example.com"
          description="The URL to navigate to."
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
          description="Wait duration in milliseconds."
        />
      )

    case PageActionType.Click:
      return (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Element Selector</h5>
            <ScraperSelectorForm control={control} fieldName={`${fieldName}.selector`} />
          </div>
        </div>
      )

    case PageActionType.Type:
      return (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium mb-2">Element Selector</h5>
            <ScraperSelectorForm control={control} fieldName={`${fieldName}.selector`} />
          </div>

          <div>
            <h5 className="font-medium mb-2">Value to Type</h5>
            <ScraperValueForm control={control} fieldName={`${fieldName}.value`} />
          </div>

          <FormField
            control={control}
            name={`${fieldName}.clearBeforeType`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Clear Before Type</FormLabel>
                  <FormDescription>Whether to clear the input field before typing.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )
  }
}
