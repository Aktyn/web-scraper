import { mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import {
  ExecutionItemType,
  type JobExecutionItem,
  type UpsertScraperJobSchema,
} from '@web-scraper/common'
import { Fragment, memo, type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'
import { Measurer } from '../common/measurer'
import { Button } from '../ui/button'
import { AddExecutionItemDropdown } from './add-execution-item-dropdown'
import { ExecutionItem } from './execution-item'

type Point = {
  x: number
  y: number
}

type ExecutionFlowProps = {
  execution: UpsertScraperJobSchema['execution']
  onChange?: (execution: UpsertScraperJobSchema['execution']) => void
}

export const ExecutionFlow = memo<ExecutionFlowProps>(({ execution, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleExecutionItemEditSuccess = useCallback(
    (itemIndex: number, executionItem: UpsertScraperJobSchema['execution'][number]) => {
      onChange?.(execution.map((item, index) => (index === itemIndex ? executionItem : item)))
    },
    [execution, onChange],
  )

  return (
    <Measurer
      ref={containerRef}
      className={cn(
        'inline-flex flex-row flex-wrap items-stretch justify-start relative gap-8',
        onChange && 'gap-x-5',
      )}
    >
      {(width, height) => (
        <>
          {execution.map((item, index) => (
            <Fragment key={`${index}-${item.type}`}>
              {onChange && index > 0 && (
                <AddExecutionItemDropdown
                  execution={execution}
                  onChange={onChange}
                  pushAfter={index}
                >
                  <div
                    className={cn(
                      'z-10 my-auto rounded-full box-border bg-gradient-to-r',
                      execution[index - 1].type === ExecutionItemType.CONDITION &&
                        'from-execution-condition/75',
                      execution[index - 1].type === ExecutionItemType.STEP &&
                        'from-execution-step/75',
                      item.type === ExecutionItemType.CONDITION && 'to-execution-condition/75',
                      item.type === ExecutionItemType.STEP && 'to-execution-step/75',
                    )}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-[inherit] border-dashed border-2 text-foreground border-transparent bg-clip-padding bg-background"
                    >
                      <Icon path={mdiPlus} />
                    </Button>
                  </div>
                </AddExecutionItemDropdown>
              )}
              <ExecutionItem
                data-flow-execution-type={item.type}
                item={item as JobExecutionItem}
                onEdit={
                  onChange ? (item) => handleExecutionItemEditSuccess(index, item) : undefined
                }
                onDelete={
                  onChange ? () => onChange(execution.filter((_, i) => i !== index)) : undefined
                }
                index={index}
                executionLength={execution.length}
              />
            </Fragment>
          ))}
          <FlowConnector
            key={execution.length}
            width={width}
            height={height}
            containerRef={containerRef}
          />
        </>
      )}
    </Measurer>
  )
})

ExecutionFlow.displayName = 'ExecutionFlow'

type FlowConnectorProps = {
  width: number
  height: number
  containerRef: RefObject<HTMLDivElement>
}

function FlowConnector({ width, height, containerRef }: FlowConnectorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const [paths, setPaths] = useState<
    {
      d: string
      from: Point
      to: Point
      previousExecutionType: ExecutionItemType
      currentExecutionType: ExecutionItemType
    }[]
  >([])

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('[data-flow-execution-type]')
    const svg = svgRef.current

    if (!elements?.length || !svg || !width || !height) {
      setPaths(emptyArray)
      return
    }

    const calculatedPaths: typeof paths = []

    const svgBox = svg.getBoundingClientRect()
    for (let i = 1; i < elements.length; i++) {
      const previousElement = elements[i - 1]
      const currentElement = elements[i]

      const previousExecutionType = previousElement.getAttribute(
        'data-flow-execution-type',
      ) as ExecutionItemType | null
      const currentExecutionType = currentElement.getAttribute(
        'data-flow-execution-type',
      ) as ExecutionItemType | null

      if (!previousExecutionType || !currentExecutionType) {
        continue
      }

      if (
        previousElement.getBoundingClientRect().right < currentElement.getBoundingClientRect().left
      ) {
        const from = {
          x: Math.floor(previousElement.getBoundingClientRect().right - svgBox.left),
          y: Math.floor(
            (previousElement.getBoundingClientRect().top +
              previousElement.getBoundingClientRect().bottom) /
              2 -
              svgBox.top,
          ),
        }
        const to = {
          x: Math.floor(currentElement.getBoundingClientRect().left - svgBox.left),
          y: Math.floor(
            (currentElement.getBoundingClientRect().top +
              currentElement.getBoundingClientRect().bottom) /
              2 -
              svgBox.top,
          ),
        }
        calculatedPaths.push({
          from,
          to,
          d: generatePath(from, to, true),
          previousExecutionType,
          currentExecutionType,
        })
      } else {
        const from = {
          x: Math.floor(
            (previousElement.getBoundingClientRect().left +
              previousElement.getBoundingClientRect().right) /
              2 -
              svgBox.left,
          ),
          y: Math.floor(previousElement.getBoundingClientRect().bottom - svgBox.top),
        }
        const to = {
          x: Math.floor(
            (currentElement.getBoundingClientRect().left +
              currentElement.getBoundingClientRect().right) /
              2 -
              svgBox.left,
          ),
          y: Math.floor(currentElement.getBoundingClientRect().top - svgBox.top),
        }
        calculatedPaths.push({
          from,
          to,
          d: generatePath(from, to, true),
          previousExecutionType,
          currentExecutionType,
        })
      }
    }

    setPaths(calculatedPaths)
  }, [containerRef, height, width])

  return (
    <div className="absolute left-0 top-0 w-full h-full overflow-hidden pointer-events-none">
      <svg ref={svgRef} width={width} height={height} fill="none">
        <defs>
          {paths.map((path, index) => {
            const minX = Math.min(path.from.x, path.to.x)
            const maxX = Math.max(path.from.x, path.to.x)

            const startColor = getExecutionColor(
              path.from.x < path.to.x ? path.previousExecutionType : path.currentExecutionType,
            )
            const endColor = getExecutionColor(
              path.from.x < path.to.x ? path.currentExecutionType : path.previousExecutionType,
            )

            return (
              <linearGradient
                key={index}
                id={`flowGradient${index}`}
                x1={minX}
                y1={0}
                x2={maxX}
                y2={0}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            )
          })}
        </defs>
        {paths.map((path, index) => (
          <path
            key={index}
            strokeMiterlimit={10}
            stroke={`url(#flowGradient${index})`}
            d={path.d}
            strokeWidth={2}
            strokeDasharray="6, 4"
          />
        ))}
      </svg>
    </div>
  )
}

function getExecutionColor(executionType: ExecutionItemType) {
  switch (executionType) {
    case ExecutionItemType.CONDITION:
      return 'hsl(var(--execution-condition) / 0.75)'
    case ExecutionItemType.STEP:
      return 'hsl(var(--execution-step) / 0.75)'
  }
}

function generatePath(from: Point, to: Point, quadratic = false) {
  if (quadratic && Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
    const middleY = (from.y + to.y) / 2
    const yDiff = from.y - to.y
    return `M ${from.x} ${from.y} Q ${from.x} ${middleY}, ${from.x + yDiff / 2} ${middleY} H ${
      to.x - yDiff / 2
    } Q ${to.x} ${middleY}, ${to.x} ${to.y}`
  }
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
}

const emptyArray = [] as never[]
