import { memo } from 'react'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { yupResolver } from '@hookform/resolvers/yup'
import { mdiContentSave } from '@mdi/js'
import Icon from '@mdi/react'
import {
  type ScraperJob,
  type UpsertScraperJobSchema,
  upsertScraperJobSchema,
} from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { FormInput } from '../common/form/form-input'
import { Button } from '../ui/button'
import { ExecutionForm } from './execution-form'

type ScraperJobFormProps = {
  onSubmit: (values: UpsertScraperJobSchema) => void
  scraperJob?: ScraperJob
  creating?: boolean
}

export const ScraperJobForm = memo<ScraperJobFormProps>(
  ({ onSubmit, scraperJob, creating }) => {
    const form = useForm<UpsertScraperJobSchema>({
      resolver: yupResolver(upsertScraperJobSchema),
      mode: 'onSubmit',
      defaultValues: scraperJob ?? upsertScraperJobSchema.getDefault(),
    })

    return (
      <Form {...form}>
        <form
          id="scraper-job-creator-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-4 items-start"
        >
          <div className="flex flex-row flex-wrap items-stretch gap-x-4">
            <FormInput
              control={form.control}
              name="name"
              label="Job name"
              placeholder="Name shortly describing what the job does"
              inputProps={{ className: 'w-80' }}
            />
            <FormInput
              control={form.control}
              name="startUrl"
              label="Start URL"
              placeholder="URL to navigate to before starting the execution"
              inputProps={{ className: 'w-80' }}
            />
            <FormField
              control={form.control}
              name="execution"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-start">
                  <FormLabel>Execution</FormLabel>
                  <ExecutionForm {...field} />
                  <FormMessage reserveSpace />
                </FormItem>
              )}
            />
          </div>
          <Button
            form="scraper-job-creator-form"
            size="lg"
            variant="default"
            type="submit"
            disabled={form.formState.isSubmitted && !form.formState.isValid}
            loading={creating}
          >
            <Icon path={mdiContentSave} />
            Save
          </Button>
        </form>
      </Form>
    )
  },
  (prev, next) => prev.creating === next.creating,
)

ScraperJobForm.displayName = 'ScraperJobForm'
