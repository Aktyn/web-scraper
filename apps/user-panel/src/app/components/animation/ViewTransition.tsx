import type { ReactElement, RefObject } from 'react'
import { cloneElement, isValidElement, memo, useLayoutEffect, useRef } from 'react'
import anime from 'animejs'
import { useView } from 'src/app/hooks/useView'
import { Config } from '../../config'
import { ViewTransitionState } from '../../context/viewContext'
import Navigation from '../../navigation'

interface ViewTransitionProps {
  children: ReactElement<{ ref?: RefObject<HTMLElement> }>
  targets?: string | ((element: HTMLElement) => anime.AnimeParams['targets'])
}

export const ViewTransition = memo(({ children: child, targets }: ViewTransitionProps) => {
  const targetRef = useRef<HTMLElement>(null)
  const view = useView()

  useLayoutEffect(() => {
    if (!targetRef.current || view.viewTransitionState === ViewTransitionState.IDLE) {
      return
    }

    const animeTargets =
      typeof targets === 'function' ? targets(targetRef.current) : targets ?? targetRef.current

    if (!animeTargets) {
      return
    }

    //TODO: different transition types other than translate

    const [startView, endView] =
      view.viewTransitionState === ViewTransitionState.LEAVING
        ? [Navigation[view.viewName], Navigation[view.nextViewName ?? 'DASHBOARD']]
        : [Navigation[view.viewName], Navigation[view.previousViewName ?? 'DASHBOARD']]

    const normalizedVectorDifference = normalize([
      endView.gridPosition[0] - startView.gridPosition[0],
      endView.gridPosition[1] - startView.gridPosition[1],
    ])

    const translationLengthRem = 6

    anime.remove(animeTargets)
    anime({
      targets: animeTargets,
      translateX: {
        value: ['0rem', `${-normalizedVectorDifference[0] * translationLengthRem}rem`],
        delay: anime.stagger(50, { start: 0, from: 'first' }),
      },
      translateY: {
        value: ['0rem', `${-normalizedVectorDifference[1] * translationLengthRem}rem`],
        delay: anime.stagger(50, { start: 0, from: 'first' }),
      },
      opacity: [1, 0],
      easing: 'easeInBack',
      duration: Math.round(Config.VIEW_TRANSITION_DURATION / 2),
      direction: view.viewTransitionState === ViewTransitionState.LEAVING ? 'normal' : 'reverse',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.viewTransitionState])

  return isValidElement(child)
    ? cloneElement(child, {
        ref: targetRef,
      })
    : child
})

function normalize(vector: [number, number]) {
  const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2)
  if (length < 1e-6) {
    return [0, 0]
  }
  return [vector[0] / length, vector[1] / length]
}
