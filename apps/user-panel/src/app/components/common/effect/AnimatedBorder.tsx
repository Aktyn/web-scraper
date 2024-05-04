import { memo, useEffect, useRef, type SVGProps } from 'react'
import { Box, Fade, type BoxProps } from '@mui/material'
import anime from 'animejs'
import { AutoSizer } from '../AutoSizer'

type AnimatedBorderProps = Omit<BoxProps, 'borderRadius'> & {
  active: boolean
  offset?: number
  animationDuration?: number
  borderRadius?: number | `${number}` | `${number}${'px' | 'rem'}` | 'max'
  rectProps?: Omit<SVGProps<SVGRectElement>, 'strokeDasharray' | 'strokeWidth'> & {
    strokeDasharray?: number | [number, number]
    strokeWidth?: number
  }
}

export const AnimatedBorder = memo<AnimatedBorderProps>(
  ({
    children,
    active,
    offset = 0,
    animationDuration = 400,
    borderRadius = 0,
    rectProps = {},
    ...boxProps
  }) => {
    const svgRef = useRef<SVGSVGElement>(null)

    const strokeWidth = rectProps.strokeWidth ?? 4
    const strokeDasharray = rectProps.strokeDasharray ?? 8

    useEffect(() => {
      const rect = svgRef.current?.querySelector('rect')
      if (!rect) {
        return
      }

      const dasharraySum = Array.isArray(strokeDasharray)
        ? strokeDasharray.reduce((a, b) => a + b, 0)
        : strokeDasharray

      anime.remove(rect)
      if (active) {
        anime({
          targets: rect,
          strokeDashoffset: [dasharraySum * 2, 0],
          easing: 'linear',
          duration: animationDuration,
          loop: true,
        })
      }
    }, [active, animationDuration, strokeDasharray])

    return (
      <AutoSizer sx={{ width: 'auto', height: 'auto' }}>
        {({ width, height }) => {
          const innerWidth = width - offset * 2
          const innerHeight = height - offset * 2

          return (
            <Box
              {...boxProps}
              sx={{
                display: 'inline-block',
                position: 'relative',
                ...boxProps.sx,
              }}
            >
              {children}
              <Fade in={active} unmountOnExit>
                <svg
                  ref={svgRef}
                  style={{
                    position: 'absolute',
                    left: `${offset}px`,
                    top: `${offset}px`,
                    width: `${innerWidth}px`,
                    height: `${innerHeight}px`,
                    pointerEvents: 'none',
                  }}
                  viewBox={`0 0 ${innerWidth} ${innerHeight}`}
                >
                  <rect
                    x={strokeWidth / 2}
                    y={strokeWidth / 2}
                    width={innerWidth - strokeWidth}
                    height={innerHeight - strokeWidth}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    stroke="#fff"
                    rx={
                      borderRadius === 'max' ? Math.min(innerWidth, innerHeight) / 2 : borderRadius
                    }
                    ry={
                      borderRadius === 'max' ? Math.min(innerWidth, innerHeight) / 2 : borderRadius
                    }
                    {...rectProps}
                    strokeDasharray={
                      Array.isArray(strokeDasharray) ? strokeDasharray.join(' ') : strokeDasharray
                    }
                  />
                </svg>
              </Fade>
            </Box>
          )
        }}
      </AutoSizer>
    )
  },
)
