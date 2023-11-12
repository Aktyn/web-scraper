import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
import {
  alpha,
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  listItemTextClasses,
  type SvgIconProps,
  type SxProps,
  type Theme,
} from '@mui/material'
import { common } from '@mui/material/colors'
import anime from 'animejs'
import { commonLayoutTransitions, maximizedWindowBorderRadiusPx } from './helpers'
import { Config } from '../config'
import { type ViewName, ViewTransitionState } from '../context/viewContext'
import { useView } from '../hooks/useView'
import { Navigation } from '../navigation'

export interface MenuItemProps {
  label: ReactNode
  icon: SvgIconComponent | ((svgProps: SvgIconProps) => ReactNode)
  viewName: ViewName
}

export const MenuItem = ({ label, icon: Icon, viewName }: MenuItemProps) => {
  const itemRef = useRef<HTMLLIElement>(null)
  const view = useView()

  const selected =
    view.viewName === viewName ||
    (view.viewTransitionState === ViewTransitionState.LEAVING && view.nextViewName === viewName)

  const textColorStyle: SxProps<Theme> = {
    color: (theme) => (selected ? theme.palette.text.primary : theme.palette.text.secondary),
    transition: commonLayoutTransitions.color,
  }

  useEffect(() => {
    const selected =
      view.viewName === viewName &&
      [ViewTransitionState.IDLE, ViewTransitionState.ENTERING].includes(view.viewTransitionState)

    anime({
      targets: itemRef.current?.querySelector('.indicator'),
      translateX: selected ? '0.3rem' : '0.15rem',
      opacity: selected ? 1 : 0.5,
      easing: 'easeInOutCirc',
      duration: Math.round(Config.VIEW_TRANSITION_DURATION / 2),
    })
  }, [view.viewName, view.viewTransitionState, viewName])

  const animateMenuItemText = useCallback((target: EventTarget, enable: boolean) => {
    const targets = (target as HTMLElement).querySelector(`.${listItemTextClasses.root}`)

    anime.remove(targets)
    anime({
      targets,
      translateX: enable ? '-0.5rem' : '0rem',
      easing: 'spring(0.7, 100, 10, 0)',
    })
  }, [])

  return (
    <ListItem
      ref={itemRef}
      disablePadding
      sx={
        selected
          ? {
              '& .indicator': {
                borderTopRightRadius: '0.25rem',
                borderBottomRightRadius: '0.25rem',
              },
            }
          : {
              '&:first-of-type .indicator': {
                borderTopRightRadius: '0.125rem',
              },
              '&:last-of-type .indicator': {
                borderBottomRightRadius: '0.125rem',
              },
            }
      }
    >
      <ListItemButton
        selected={selected}
        disableRipple={selected}
        disableTouchRipple={selected}
        onClick={
          selected
            ? undefined
            : (event) => {
                animateMenuItemText(event.currentTarget, false)
                view.requestViewChange(viewName)
              }
        }
        onMouseEnter={selected ? undefined : (event) => animateMenuItemText(event.target, true)}
        onMouseLeave={
          selected
            ? undefined
            : (event) => setTimeout(() => animateMenuItemText(event.target, false), 1)
        }
        sx={{
          ...textColorStyle,
          position: 'relative',
          cursor: selected ? 'auto' : 'pointer',
          transition: (theme) => theme.transitions.create('background-color'),
          '&:hover': selected
            ? {
                backgroundColor: (theme) => `${alpha(theme.palette.primary.main, 0.16)} !important`,
              }
            : undefined,
        }}
      >
        <ListItemIcon sx={textColorStyle}>
          <Icon color="inherit" />
        </ListItemIcon>
        <ListItemText primary={label} color="inherit" />
        <Box
          className="indicator"
          sx={{
            position: 'absolute',
            left: !view.maximized
              ? `calc(-0.3rem - ${maximizedWindowBorderRadiusPx}px)`
              : '-0.3rem',
            top: 0,
            height: '100%',
            width: '0.3rem',
            transition: (theme) =>
              theme.transitions.create('border-radius', {
                duration: Config.VIEW_TRANSITION_DURATION / 2,
              }),
            backgroundColor: Navigation[viewName].theme?.palette.primary.main ?? common.white,
            pointerEvents: 'none',
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
