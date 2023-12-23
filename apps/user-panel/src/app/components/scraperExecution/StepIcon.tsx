import { CheckCircleRounded, CircleRounded, ErrorRounded } from '@mui/icons-material'
import { Skeleton, type StepIconProps } from '@mui/material'

export const StepIcon = (props: StepIconProps) => {
  if (!props.completed && props.active) {
    return (
      <Skeleton
        className={props.className}
        variant="circular"
        width={24}
        height={24}
        sx={{
          ...props.sx,
        }}
      />
    )
  }

  const IconComponent = props.error
    ? ErrorRounded
    : props.completed
      ? CheckCircleRounded
      : CircleRounded

  return (
    <IconComponent
      className={props.className}
      sx={{
        ...props.sx,
        transform: `scale(${props.active ? 1 : 0.618})`,
        transition: (theme) => theme.transitions.create('transform'),
        fill: (theme) =>
          props.error
            ? theme.palette.error.main
            : props.active
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
      }}
    />
  )
}
