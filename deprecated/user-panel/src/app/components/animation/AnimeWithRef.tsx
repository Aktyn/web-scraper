import { cloneElement, isValidElement, memo, useEffect, useRef, type RefObject } from 'react'
import anime from 'animejs'

type AnimeProps = Omit<anime.AnimeParams, 'targets'> & {
  targets?: string | ((element: HTMLElement) => anime.AnimeParams['targets'])
  children: React.ReactElement<{ ref?: RefObject<HTMLElement> }>
}

export const AnimeWithRef = memo(({ children: child, targets, ...animeProps }: AnimeProps) => {
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!targetRef.current) {
      return
    }

    const animeTargets =
      typeof targets === 'function' ? targets(targetRef.current) : (targets ?? targetRef.current)

    if (!animeTargets) {
      return
    }

    anime.remove(animeTargets)
    anime({
      targets: animeTargets,
      ...animeProps,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(animeProps ?? {})])

  return isValidElement(child)
    ? cloneElement(child, {
        ref: targetRef,
      })
    : child
})
