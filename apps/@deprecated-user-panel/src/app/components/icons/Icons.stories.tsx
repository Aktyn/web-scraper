import type { ComponentType, ExoticComponent } from 'react'
import { Box, type SvgIconProps } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { AktynLogoIcon } from './AktynLogoIcon'
import { CloseWindowIcon } from './CloseWindowIcon'
import { CursorDefaultClickIcon } from './CursorDefaultClickIcon'
import { DatabaseIcon } from './DatabaseIcon'
import { FractionIcon } from './FractionIcon'
import { MaximizeWindowIcon } from './MaximizeWindowIcon'
import { MinimizeWindowIcon } from './MinimizeWindowIcon'
import { NumericIcon } from './NumericIcon'
import { RecaptchaIcon } from './RecaptchaIcon'
import { RegexIcon } from './RegexIcon'
import { RestoreWindowIcon } from './RestoreWindowIcon'
import { RoutineIcon } from './RoutineIcon'

type IconComponent = ComponentType<SvgIconProps> | ExoticComponent<SvgIconProps>
const IconRenderer = ({ icon: Icon, ...props }: { icon: IconComponent | null } & SvgIconProps) =>
  Icon && <Icon {...props} />

const meta = {
  title: 'Icons',
  component: IconRenderer,
  parameters: { layout: 'centered' },
  argTypes: {
    fontSize: {
      control: 'select',
      options: ['small', 'inherit', 'large', 'medium'],
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'action',
        'disabled',
        'primary',
        'secondary',
        'error',
        'info',
        'success',
        'warning',
      ],
    },
  },
  args: { fontSize: 'large', color: 'inherit' },
} satisfies Meta<typeof IconRenderer>

export default meta
type Story = StoryObj<typeof meta>

const iconComponents = [
  AktynLogoIcon,
  CloseWindowIcon,
  CursorDefaultClickIcon,
  DatabaseIcon,
  FractionIcon,
  MaximizeWindowIcon,
  MinimizeWindowIcon,
  NumericIcon,
  RecaptchaIcon,
  RegexIcon,
  RestoreWindowIcon,
  RoutineIcon,
] satisfies IconComponent[]

export const AllIcons: Story = {
  render: ({ icon: _, ...iconProps }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(iconComponents.length))}, 1fr)`,
        gap: '1rem',
      }}
    >
      {iconComponents.map((Icon, index) => (
        <Icon key={index} {...iconProps} />
      ))}
    </Box>
  ),
  args: { icon: null },
}
export const AktynLogo: Story = { args: { icon: AktynLogoIcon } }
export const CloseWindow: Story = { args: { icon: CloseWindowIcon } }
export const CursorDefaultClick: Story = { args: { icon: CursorDefaultClickIcon } }
export const Database: Story = { args: { icon: DatabaseIcon } }
export const Fraction: Story = { args: { icon: FractionIcon } }
export const MaximizeWindow: Story = { args: { icon: MaximizeWindowIcon } }
export const MinimizeWindow: Story = { args: { icon: MinimizeWindowIcon } }
export const Numeric: Story = { args: { icon: NumericIcon } }
export const Recaptcha: Story = { args: { icon: RecaptchaIcon } }
export const Regex: Story = { args: { icon: RegexIcon } }
export const RestoreWindow: Story = { args: { icon: RestoreWindowIcon } }
export const Routine: Story = { args: { icon: RoutineIcon } }
