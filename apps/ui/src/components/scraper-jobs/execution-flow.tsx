import { mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import { type JobExecutionItem, type UpsertScraperJobSchema } from '@web-scraper/common'
import { Fragment, memo, type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'
import { Measurer } from '../common/measurer'
import { Button } from '../ui/button'
import { AddExecutionItemDropdown } from './add-execution-item-dropdown'
import { ExecutionItem } from './execution-item'

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
                  <Button
                    variant="outline"
                    size="icon"
                    className="z-10 rounded-full border-dashed border-2 border-execution-condition/50 hover:border-execution-condition text-foreground my-auto"
                  >
                    <Icon path={mdiPlus} />
                  </Button>
                </AddExecutionItemDropdown>
              )}
              <ExecutionItem
                data-flow-index={index}
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

  const [paths, setPaths] = useState<string[]>([])

  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('[data-flow-index]')
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

      if (
        previousElement.getBoundingClientRect().right < currentElement.getBoundingClientRect().left
      ) {
        calculatedPaths.push(
          generatePath(
            {
              x: Math.floor(previousElement.getBoundingClientRect().right - svgBox.left),
              y: Math.floor(
                (previousElement.getBoundingClientRect().top +
                  previousElement.getBoundingClientRect().bottom) /
                  2 -
                  svgBox.top,
              ),
            },
            {
              x: Math.floor(currentElement.getBoundingClientRect().left - svgBox.left),
              y: Math.floor(
                (currentElement.getBoundingClientRect().top +
                  currentElement.getBoundingClientRect().bottom) /
                  2 -
                  svgBox.top,
              ),
            },
          ),
        )
      } else {
        calculatedPaths.push(
          generatePath(
            {
              x: Math.floor(
                (previousElement.getBoundingClientRect().left +
                  previousElement.getBoundingClientRect().right) /
                  2 -
                  svgBox.left,
              ),
              y: Math.floor(previousElement.getBoundingClientRect().bottom - svgBox.top),
            },
            {
              x: Math.floor(
                (currentElement.getBoundingClientRect().left +
                  currentElement.getBoundingClientRect().right) /
                  2 -
                  svgBox.left,
              ),
              y: Math.floor(currentElement.getBoundingClientRect().top - svgBox.top),
            },
            true,
          ),
        )
      }
    }

    setPaths(calculatedPaths)
  }, [containerRef, height, width])

  return (
    <div className="absolute left-0 top-0 w-full h-full overflow-hidden pointer-events-none">
      <svg ref={svgRef} width={width} height={height} fill="none">
        {paths.map((path, index) => (
          <path
            key={index}
            className="stroke-execution-condition/50"
            d={path}
            strokeWidth={2}
            strokeDasharray="6, 4"
          />
        ))}
      </svg>
    </div>
  )
}

type Point = {
  x: number
  y: number
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
