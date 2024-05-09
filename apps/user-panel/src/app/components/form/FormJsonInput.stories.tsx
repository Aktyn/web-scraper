import { type FC } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import type { Meta, StoryObj } from '@storybook/react'
import { upsertActionSchema } from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import type * as yup from 'yup'
import { FormJsonInput, type FormJsonInputProps } from './FormJsonInput'

type UpsertActionSchema = yup.InferType<typeof upsertActionSchema>

type MockFormInputProps = Omit<FormJsonInputProps<UpsertActionSchema, 'name'>, 'name' | 'form'>

const MockFormInput: FC<MockFormInputProps> = (partialProps) => {
  const form = useForm({
    mode: 'all',
    resolver: yupResolver(upsertActionSchema),
    defaultValues: { name: '{"foo": "bar"}' },
  })

  return <FormJsonInput name="name" form={form} required {...partialProps} />
}

const meta = {
  title: 'Form/FormJsonInput',
  component: MockFormInput,
  parameters: { layout: 'centered' },
  args: { required: true, label: 'JSON value' },
} satisfies Meta<typeof MockFormInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
