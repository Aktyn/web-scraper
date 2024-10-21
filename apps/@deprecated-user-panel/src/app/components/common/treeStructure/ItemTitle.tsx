import { Typography, type TypographyProps } from '@mui/material'

export const ItemTitle = ({
  children,
  ...typographyProps
}: Omit<TypographyProps, 'children'> & { children: string }) => (
  <Typography
    variant="body1"
    color="text.secondary"
    fontWeight="bold"
    textAlign="center"
    whiteSpace="nowrap"
    {...typographyProps}
  >
    {children}
  </Typography>
)
