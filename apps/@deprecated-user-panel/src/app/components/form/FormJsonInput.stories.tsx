import { type FC } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { upsertActionSchema } from '@web-scraper/common'
import { useForm } from 'react-hook-form'
import type * as yup from 'yup'
import { FormJsonInput, type FormJsonInputProps } from './FormJsonInput'
import { CustomDrawer } from '../common/CustomDrawer'

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
  decorators: [
    (Story) => (
      <CustomDrawer title="JSON input" defaultOpen>
        <Box p="2rem">
          <Story />
        </Box>
      </CustomDrawer>
    ),
  ],
  parameters: { layout: 'centered' },
  args: { required: true, label: 'JSON value' },
} satisfies Meta<typeof MockFormInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
