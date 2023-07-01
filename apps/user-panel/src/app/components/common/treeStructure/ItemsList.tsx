import { useState, type Key, type ReactNode } from 'react'
import { AddRounded, DeleteRounded, ExpandMoreRounded, PlayArrowRounded } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  accordionSummaryClasses,
  darken,
  lighten,
  type Theme,
  alpha,
  Tooltip,
  Grow,
} from '@mui/material'
import { ItemTitle } from './ItemTitle'
import { mixColors } from '../../../themes'
import { LoadingIconButton } from '../button/LoadingIconButton'

interface ItemsListProps<ItemType extends object | string | number> {
  level?: number
  title: ReactNode
  children: (item: ItemType, index: number) => [Key, ReactNode]
  items: ItemType[]
  disabled?: boolean
  onAdd?: () => void
  onDelete?: (item: ItemType, index: number) => void
  onPlay?: (item: ItemType, index: number) => void
  onPlayTooltip?: ReactNode
  disablePlayButtons?: boolean
  loadingPlayButtonIndex?: number
}

export const ItemsList = <ItemType extends object | string | number>({
  level = 0,
  title,
  children: getChild,
  items,
  disabled,
  onAdd,
  onDelete,
  onPlay,
  onPlayTooltip = 'Play',
  disablePlayButtons,
  loadingPlayButtonIndex,
}: ItemsListProps<ItemType>) => {
  const [expanded, setExpanded] = useState(true)

  const allowExpand = level > 0
  const borderColor = (theme: Theme) =>
    alpha(mixColors(theme.palette.primary.main, theme.palette.secondary.main, 0.15), 0.5)
  const borderStyle = (theme: Theme) => `1px solid ${borderColor(theme)}`

  return (
    <Accordion
      expanded={items.length > 0 && expanded}
      onChange={allowExpand ? (_, expand) => setExpanded(expand) : undefined}
      TransitionProps={{ unmountOnExit: true }}
      square
      disableGutters
      disabled={items.length === 0}
      elevation={level > 0 ? 4 : 0}
      sx={{
        '&::before': {
          display: 'none',
        },
        width: level > 1 ? 'auto' : '100%',
        mr: level > 1 ? 'calc(-1rem + 2px)' : undefined,
        backgroundColor: disabled
          ? undefined
          : (theme) =>
              `${
                level
                  ? level % 2 === 0
                    ? lighten(theme.palette.background.paper, 0.05)
                    : darken(theme.palette.background.paper, 0.05)
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
          height: '58px',
          opacity: '1 !important',
          pl: level > 0 ? 0 : '0.5rem',
          cursor: allowExpand ? 'pointer' : 'default !important',
          '& > *': {
            cursor: allowExpand ? 'pointer' : 'default !important',
            alignItems: 'center',
            justifyContent: 'flex-start',
          },
          [`& .${accordionSummaryClasses.expandIconWrapper}`]:
            items.length === 0
              ? {
                  color: (theme) => theme.palette.action.disabled,
                }
              : {},
        }}
      >
        {(items.length > 0 || level > 0) && (
          <Box
            sx={{
              height: 0,
              borderTop: borderStyle,
              width: level > 0 ? '3rem' : '2rem',
              mr: '0.5rem',
              ml: level > 0 ? 'calc(-1rem - 1px)' : 0,
            }}
          />
        )}
        {typeof title === 'string' ? <ItemTitle mr={2}>{title}</ItemTitle> : title}
        {onAdd && (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation()
              onAdd()
              setExpanded(true)
            }}
            disabled={disabled}
            sx={{
              justifySelf: 'flex-end',
              mr: allowExpand ? '0.5rem' : undefined,
              ml: 'auto',
              pointerEvents: 'all',
            }}
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
          rowGap={4}
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: '-37px', //(58px of MuiAccordionSummary) / 2 + 8px padding of MuiAccordionDetails
              left: '-1px',
              bottom: 0,
              width: '1px',
              backgroundImage: (theme) =>
                `linear-gradient(to top, transparent, ${borderColor(theme)} 4rem)`,
            },
          }}
        >
          {items.map((field, index) => {
            const [key, child] = getChild(field, index)

            return (
              <Box key={key ?? index} sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: '50%',
                    height: '1rem',
                    borderTop: borderStyle,
                    borderRight: borderStyle,
                    borderTopRightRadius: '0.5rem',
                  }}
                />
                {(onDelete || onPlay) && (
                  <>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 'calc(50% - 1px)',
                        right: onDelete && onPlay ? '4.25rem' : '2.125rem',
                        height: '0.5rem',
                        borderTop: borderStyle,
                        borderLeft: borderStyle,
                        borderTopLeftRadius: '0.5rem',
                      }}
                    />
                    {onPlay && (
                      <Grow in>
                        <Tooltip title={onPlayTooltip}>
                          <LoadingIconButton
                            size="small"
                            onClick={() => onPlay(field, index)}
                            sx={{
                              position: 'absolute',
                              top: '-1.075rem',
                              right: onDelete ? '2.125rem' : '0',
                              zIndex: 1,
                            }}
                            disabled={disablePlayButtons}
                            loading={loadingPlayButtonIndex === index}
                          >
                            <PlayArrowRounded />
                          </LoadingIconButton>
                        </Tooltip>
                      </Grow>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        disabled={disabled}
                        onClick={() => onDelete(field, index)}
                        sx={{
                          position: 'absolute',
                          top: '-1.075rem',
                          right: '0',
                          zIndex: 1,
                        }}
                      >
                        <DeleteRounded />
                      </IconButton>
                    )}
                  </>
                )}
                <Stack justifyContent="flex-start" alignItems="stretch" px="1rem" pt="0.5rem">
                  {child}
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
