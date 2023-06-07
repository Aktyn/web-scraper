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
import anime from 'animejs'
import { commonLayoutTransitions } from './helpers'
import { Config } from '../config'
import type { ViewName } from '../context/viewContext'
import { ViewTransitionState } from '../context/viewContext'
import { useView } from '../hooks/useView'

export interface MenuItemProps {
  label: ReactNode
  icon: SvgIconComponent | ((svgProps: SvgIconProps) => JSX.Element)
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
    const show =
      view.viewName === viewName &&
      [ViewTransitionState.IDLE, ViewTransitionState.ENTERING].includes(view.viewTransitionState)

    anime({
      targets: itemRef.current?.querySelector('.indicator'),
      scaleY: show ? 1 : 0,
      opacity: show ? 1 : 0,
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
    <ListItem ref={itemRef} disablePadding>
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
            left: 0,
            top: 0,
            height: '100%',
            width: '0.125rem',
            backgroundColor: (theme) => theme.palette.primary.main,
            transition: commonLayoutTransitions.backgroundColor,
            borderRadius: '0.125rem',
            pointerEvents: 'none',
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
