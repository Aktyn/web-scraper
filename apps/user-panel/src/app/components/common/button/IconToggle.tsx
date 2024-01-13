import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'
import {
  alpha,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  type SvgIconTypeMap,
  type SxProps,
  type IconButtonProps,
} from '@mui/material'
import anime from 'animejs'

const sizeRem = 1.875

type SupportedValue = string | number | boolean

interface OptionSchema<ValueType extends SupportedValue> {
  value: ValueType
  icon: ReactElement<SvgIconTypeMap<unknown, 'svg'>>
}

interface IconToggleProps<ValueType extends SupportedValue> {
  tooltipTitle: ReactNode
  options: Readonly<[OptionSchema<ValueType>, OptionSchema<ValueType>]>
  value: ValueType
  onChange: (value: ValueType) => void
  sx?: SxProps
  buttonProps?: IconButtonProps
}

export const IconToggle = <ValueType extends SupportedValue>({
  tooltipTitle,
  options,
  value,
  onChange,
  sx,
  buttonProps,
}: IconToggleProps<ValueType>) => {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const firstChild = ref.current.querySelector('div:nth-child(1)')
    const secondChild = ref.current.querySelector('div:nth-child(2)')

    const [selectedOptionButton, unselectedOptionButton] =
      value === options[0].value ? [firstChild, secondChild] : [secondChild, firstChild]

    anime.remove(selectedOptionButton)
    anime.remove(unselectedOptionButton)

    const commonAnimeProps: Partial<anime.AnimeParams> = {
      easing: 'spring(0.7, 100, 10, 0)',
      duration: 500,
    }

    anime({
      ...commonAnimeProps,
      targets: selectedOptionButton,
      opacity: 1,
      translateX: `${sizeRem}rem`,
      backgroundColor: theme.palette.action.selected,
      borderColor: theme.palette.primary.main,
    })
    anime({
      ...commonAnimeProps,
      targets: unselectedOptionButton,
      opacity: 0.5,
      translateX: '0rem',
      backgroundColor: alpha(theme.palette.action.selected, 0),
      borderColor: alpha(theme.palette.primary.main, 0),
    })
  }, [options, theme.palette.action.selected, theme.palette.primary.main, value])

  return (
    <Tooltip title={tooltipTitle}>
      <Stack
        ref={ref}
        className="no-draggable"
        direction="row"
        alignItems="center"
        height={`${sizeRem}rem`}
        width={`${sizeRem * 2}rem`}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: `${sizeRem}rem`,
          overflow: 'visible',
          position: 'relative',
          cursor: 'pointer',
          backgroundColor: '#fff1',
          transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
          '&:hover': {
            backgroundColor: (theme) => theme.palette.action.selected,
          },
          ...sx,
        }}
        onClick={(event) => {
          event.stopPropagation()
          onChange(value === options[0].value ? options[1].value : options[0].value)
        }}
      >
        {options.map((option) => (
          <IconButton
            component="div"
            size="small"
            key={option.value.toString()}
            {...buttonProps}
            sx={{
              pointerEvents: 'none',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              border: '1px solid transparent',
              ...buttonProps?.sx,
            }}
          >
            {option.icon}
          </IconButton>
        ))}
      </Stack>
    </Tooltip>
  )
}
