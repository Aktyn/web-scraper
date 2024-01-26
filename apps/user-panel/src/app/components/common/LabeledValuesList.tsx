import { type ReactNode, Fragment } from 'react'
import { Typography, Box, type BoxProps } from '@mui/material'

interface LabeledValuesListProps {
  data: { label: string; value: ReactNode }[]
  skipEmptyValues?: boolean
  sx?: BoxProps['sx']
}

export const LabeledValuesList = ({ data, skipEmptyValues, sx = {} }: LabeledValuesListProps) => {
  return (
    <Box
      sx={{
        display: 'inline-grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        columnGap: 1,
        margin: 'auto',
        ...sx,
      }}
    >
      {data.map(
        ({ label, value }, index) =>
          (!skipEmptyValues || (value !== null && value !== undefined)) && (
            <Fragment key={label + index}>
              <Typography
                variant="body2"
                color={(theme) => theme?.palette.text.secondary}
                textAlign="right"
                whiteSpace="pre-wrap"
              >
                {label}:
              </Typography>
              {typeof value === 'string' || typeof value === 'number' ? (
                <Typography variant="body1" fontWeight="bold">
                  {value}
                </Typography>
              ) : (
                value
              )}
            </Fragment>
          ),
      )}
    </Box>
  )
}
