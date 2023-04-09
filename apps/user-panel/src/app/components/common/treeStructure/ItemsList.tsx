import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AddRounded, DeleteRounded, ExpandMoreRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  darken,
  IconButton,
  lighten,
  Stack,
  type Theme,
  Typography,
} from '@mui/material'
import anime from 'animejs'

interface ItemsListProps<ItemType extends object> {
  level?: number
  title: ReactNode
  children: (item: ItemType, index: number) => ReactNode
  items: ItemType[]
  onAdd?: () => void
  onDelete?: (item: ItemType, index: number) => void
}

export const ItemsList = <ItemType extends object>({
  level = 0,
  title,
  children,
  items,
  onAdd,
  onDelete,
}: ItemsListProps<ItemType>) => {
  const upArrowIconRef = useRef<SVGSVGElement>(null)

  const [expanded, setExpanded] = useState(true)

  const allowExpand = level > 0
  const borderStyle = (theme: Theme) => `2px solid ${theme.palette.primary.main}`

  useEffect(() => {
    anime({
      targets: upArrowIconRef.current,
    })
  }, [])

  return (
    <Accordion
      expanded={expanded}
      onChange={allowExpand ? (_, expand) => setExpanded(expand) : undefined}
      TransitionProps={{ unmountOnExit: true }}
      square
      disableGutters
      elevation={level > 0 ? 4 : 0}
      sx={{
        '&::before': {
          display: 'none',
        },
        width: level > 1 ? 'auto' : '100%',
        borderRadius: '0.5rem',
        mr: level > 1 ? 'calc(-1rem + 2px)' : undefined,
        backgroundColor: (theme) =>
          `${
            level
              ? level % 2 === 0
                ? alpha(darken(theme.palette.background.paper, 0.4), 0.2)
                : alpha(lighten(theme.palette.background.paper, 0.1), 0.1)
              : 'transparent'
          } !important`,
        backdropFilter: level ? undefined : 'none',
        border: level ? undefined : 'none',
        overflow: 'visible',
      }}
    >
      <AccordionSummary
        expandIcon={allowExpand ? <ExpandMoreRounded /> : undefined}
        sx={{
          pl: level > 0 ? '2rem' : undefined,
          cursor: allowExpand ? 'pointer' : 'default !important',
          '& > *': {
            cursor: allowExpand ? 'pointer' : 'default !important',
            alignItems: 'center',
            justifyContent: 'flex-start',
          },
        }}
      >
        {level > 0 && (
          <Box
            sx={{
              height: 0,
              borderTop: borderStyle,
              width: '3rem',
              ml: 'calc(-3rem - 2px)',
              mr: '0.5rem',
            }}
          />
        )}
        {typeof title === 'string' ? (
          <Typography variant="body1" color="text.secondary" fontWeight="bold" textAlign="center">
            {title}
          </Typography>
        ) : (
          title
        )}
        {onAdd && (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation()
              onAdd()
              setExpanded(true)
            }}
            sx={{ justifySelf: 'flex-end', mr: allowExpand ? '0.5rem' : undefined, ml: 'auto' }}
          >
            <AddRounded />
          </IconButton>
        )}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          pl: level > 0 ? 0 : '0.5rem',
        }}
      >
        <Stack
          rowGap={2}
          sx={{
            borderLeft: borderStyle,
            borderTopLeftRadius: '0.5rem',
          }}
        >
          {items.map((field, index) => (
            <Box
              key={index}
              sx={{
                '&::before': {
                  content: '""',
                  display: 'block',
                  height: '1rem',
                  borderTopRightRadius: '0.5rem',
                  borderTopLeftRadius: index === 0 ? '0.5rem' : undefined,
                  width: '50%',
                  borderTop: borderStyle,
                  borderRight: borderStyle,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent={onDelete ? 'space-between' : 'stretch'}
                columnGap={1}
                pl="1rem"
              >
                {children(field, index)}
                {onDelete && (
                  <IconButton size="small" onClick={() => onDelete(field, index)}>
                    <DeleteRounded />
                  </IconButton>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
