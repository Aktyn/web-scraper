import { type FC } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import type { Meta, StoryObj } from '@storybook/react'
import { upsertSiteTagSchema, type UpsertSiteTagSchema } from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import { FormInput, type FormInputProps } from './FormInput'

type MockFormInputProps = Omit<FormInputProps<UpsertSiteTagSchema>, 'name' | 'form'>

const MockFormInput: FC<MockFormInputProps> = (partialProps) => {
  const form = useForm({
    mode: 'all',
    resolver: yupResolver(upsertSiteTagSchema),
  })

  return <FormInput name="name" form={form} label="Name" required {...partialProps} />
}

const meta = {
  title: 'Form/FormInput',
  component: MockFormInput,
  parameters: { layout: 'centered' },
  args: { required: true, label: 'Name' },
} satisfies Meta<typeof MockFormInput>

export default meta
type Story = StoryObj<typeof meta>

export const SiteTagNameFormInput: Story = {}
