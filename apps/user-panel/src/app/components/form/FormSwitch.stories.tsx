import { type FC, type ReactNode } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import type { Meta, StoryObj } from '@storybook/react'
import { upsertActionStepSchema } from '@web-scraper/common'
import { FormProvider, useForm } from 'react-hook-form'
import { FormSwitch } from './FormSwitch'

type MockFormInputProps = {
  label: ReactNode
  disabled?: boolean
}

const MockFormInput: FC<MockFormInputProps> = (partialProps) => {
  const form = useForm({
    mode: 'all',
    resolver: yupResolver(upsertActionStepSchema),
  })

  return (
    <FormProvider {...form}>
      <FormSwitch fieldName="data.pressEnter" {...partialProps} />
    </FormProvider>
  )
}

const meta = {
  title: 'Form/FormSwitch',
  component: MockFormInput,
  parameters: { layout: 'centered' },
  args: { disabled: false, label: 'Name' },
} satisfies Meta<typeof MockFormInput>

export default meta
type Story = StoryObj<typeof meta>

export const SiteTagNameFormInput: Story = {}
