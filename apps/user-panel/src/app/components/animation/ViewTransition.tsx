import {
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useLayoutEffect,
  useRef,
  type ForwardedRef,
  type ReactElement,
  type RefObject,
} from 'react'
import anime from 'animejs'
import { useView } from 'src/app/hooks/useView'
import { Config } from '../../config'
import { ViewTransitionState } from '../../context/viewContext'
import { Navigation } from '../../navigation'

export enum TransitionType {
  DEFAULT,
  MOVE_TOP,
  MOVE_RIGHT,
  FADE,
  SCALE,
  SCALE_X,
  SCALE_Y,
}

interface ViewTransitionProps {
  children: ReactElement<{ ref?: RefObject<HTMLElement> | ForwardedRef<HTMLElement> }>
  targets?: string | ((element: HTMLElement) => anime.AnimeParams['targets'])
  type?: TransitionType
  delay?: number
}

export const ViewTransition = memo(
  forwardRef<HTMLElement, ViewTransitionProps>(
    ({ children: child, targets, type = TransitionType.DEFAULT, delay = 0 }, forwardedRef) => {
      const targetRef = useRef<HTMLElement>(null)
      const ref = forwardedRef ?? targetRef
      const view = useView()

      useLayoutEffect(() => {
        const animate = () => {
          const current = typeof ref === 'function' ? null : ref.current
          if (!current || view.viewTransitionState === ViewTransitionState.IDLE) {
            return
          }

          const animeTargets = typeof targets === 'function' ? targets(current) : targets ?? current

          if (!animeTargets) {
            return
          }

          const [startView, endView] =
            view.viewTransitionState === ViewTransitionState.LEAVING
              ? [Navigation[view.viewName], Navigation[view.nextViewName ?? 'DASHBOARD']]
              : [Navigation[view.viewName], Navigation[view.previousViewName ?? 'DASHBOARD']]

          const normalizedVectorDifference = normalize([
            endView.gridPosition[0] - startView.gridPosition[0],
            endView.gridPosition[1] - startView.gridPosition[1],
          ])

          const translationLengthRem = 6
          const leaving = view.viewTransitionState === ViewTransitionState.LEAVING

          anime.remove(animeTargets)

          const staggeredDelay = anime.stagger(50, {
            start: 0,
            from: 'first',
          })
          const commonAnimeParams: Partial<anime.AnimeParams> = {
            targets: animeTargets,
            easing: 'easeInCubic',
            duration: Math.round(Config.VIEW_TRANSITION_DURATION / 2),
            direction: leaving ? 'normal' : 'reverse',
          }
          const commonAnimeScaleProps: anime.AnimeParams['scale'] = {
            value: [1, 0],
            delay: staggeredDelay,
          }

          switch (type) {
            default:
            case TransitionType.DEFAULT:
              anime({
                ...commonAnimeParams,
                translateX: {
                  value: ['0rem', `${-normalizedVectorDifference[0] * translationLengthRem}rem`],
                  delay: staggeredDelay,
                },
                translateY: {
                  value: ['0rem', `${-normalizedVectorDifference[1] * translationLengthRem}rem`],
                  delay: staggeredDelay,
                },
                opacity: [1, 0],
              })
              break

            case TransitionType.MOVE_TOP:
              anime({
                ...commonAnimeParams,
                translateY: {
                  value: ['0rem', `${-translationLengthRem}rem`],
                  delay: staggeredDelay,
                },
                opacity: [1, 0],
              })
              break

            case TransitionType.MOVE_RIGHT:
              anime({
                ...commonAnimeParams,
                translateX: {
                  value: ['0rem', `${translationLengthRem}rem`],
                  delay: staggeredDelay,
                },
                opacity: [1, 0],
              })
              break

            case TransitionType.FADE:
              anime({
                ...commonAnimeParams,
                easing: 'easeInQuad',
                opacity: [1, 0],
              })
              break

            case TransitionType.SCALE:
              anime({
                ...commonAnimeParams,
                easing: 'easeInQuad',
                scale: commonAnimeScaleProps,
                opacity: [1, 0],
              })
              break
            case TransitionType.SCALE_X:
              anime({
                ...commonAnimeParams,
                easing: 'easeInQuad',
                scaleX: commonAnimeScaleProps,
                opacity: [1, 0],
              })
              break
            case TransitionType.SCALE_Y:
              anime({
                ...commonAnimeParams,
                easing: 'easeInQuad',
                scaleY: commonAnimeScaleProps,
                opacity: [1, 0],
              })
              break
          }
        }

        if (delay) {
          setTimeout(animate, delay)
        } else {
          animate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [type, view.viewTransitionState, delay])

      return isValidElement(child)
        ? cloneElement(child, {
            ref: ref,
          })
        : child
    },
  ),
)

function normalize(vector: [number, number]) {
  const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2)
  if (length < 1e-6) {
    return [0, 0]
  }
  return [vector[0] / length, vector[1] / length]
}
