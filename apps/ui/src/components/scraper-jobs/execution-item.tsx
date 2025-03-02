import { Bot, CornerDownLeft, Link, Pencil, Timer, Trash2 } from 'lucide-react'
import {
  ExecutionItemType,
  FlowActionType,
  parseTime,
  ScraperStepType,
  type JobExecutionItem,
  type UpsertJobExecutionItemSchema,
} from '@web-scraper/common'
import { useCallback, useState, type HTMLAttributes } from 'react'
import {
  executionItemTypeNames,
  flowActionTypeNames,
  scraperStepTypeNames,
} from '~/lib/dictionaries'
import { cn } from '~/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ExecutionItemForm } from './execution-item-form'
import { DynamicIcon } from 'lucide-react/dynamic'

type ExecutionItemProps = {
  item: JobExecutionItem
  onEdit?: (executionItem: UpsertJobExecutionItemSchema) => void
  onDelete?: () => void
  index: number
  executionLength: number
} & HTMLAttributes<HTMLDivElement>

export function ExecutionItem({
  item,
  onEdit,
  onDelete,
  index,
  executionLength,
  ...divProps
}: ExecutionItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleEditSuccess = useCallback(
    (data: UpsertJobExecutionItemSchema) => {
      onEdit?.(data)
      setEditDialogOpen(false)
    },
    [onEdit],
  )

  return (
    <div
      {...divProps}
      className={cn(
        'flex flex-row items-stretch justify-start overflow-hidden rounded-xl border animate-in fade-in-0 duration-500',
        item.type === ExecutionItemType.CONDITION &&
          'bg-execution-condition/50 border-execution-condition text-execution-condition-foreground',
        item.type === ExecutionItemType.STEP &&
          'bg-execution-step/50 border-execution-step text-execution-step-foreground',
        divProps.className,
      )}
    >
      <div className="flex grow flex-col justify-start items-stretch">
        <ExecutionItemHeader type={item.type} index={index} />
        {item.type === ExecutionItemType.CONDITION && (
          <div className="flex flex-col items-start justify-center px-2 py-1">
            <div className="flex flex-row items-baseline gap-x-2">
              <span className="text-sm font-semibold opacity-50">IF</span>
              {/* TODO: describe condition */}
              <span>...</span>
            </div>
            <div className="flex flex-row items-baseline gap-x-2">
              <span className="text-sm font-semibold opacity-50">THEN</span>
              <span>
                <b>{flowActionTypeNames[item.condition.flowAction.type]}</b>&nbsp;
                {item.condition.flowAction.type === FlowActionType.JUMP && (
                  <>
                    to <b>{item.condition.flowAction.targetExecutionItemIndex}</b>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
        {item.type === ExecutionItemType.STEP && (
          <div className="flex flex-col items-start justify-center px-2 py-1">
            <div className="flex flex-row flex-wrap items-center gap-x-1">
              <span className="text-base font-semibold">
                {scraperStepTypeNames[item.step.type]}
              </span>
              {item.step.type !== ScraperStepType.REDIRECT &&
                typeof item.step.data.element !== 'string' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Bot className="size-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Targeting element with AI
                      <br />
                      Prompt: <b>{item.step.data.element.aiPrompt}</b>
                    </TooltipContent>
                  </Tooltip>
                )}
              {item.step.type === ScraperStepType.FILL_INPUT && item.step.data.pressEnter && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CornerDownLeft className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Press enter with{' '}
                    <b>{parseTime(item.step.data.delayEnter ?? 0, 'milliseconds')}</b> delay
                  </TooltipContent>
                </Tooltip>
              )}
              {(item.step.type === ScraperStepType.FILL_INPUT ||
                item.step.type === ScraperStepType.PRESS_BUTTON) &&
                item.step.data.waitForNavigation && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Timer className="size-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {/* TODO: smart time formatting (the value will most likely be rounded to the nearest second) */}
                      Wait{' '}
                      <b>
                        {parseTime(item.step.data.waitForNavigationTimeout ?? 0, 'milliseconds')}
                      </b>{' '}
                      for navigation
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>
            {item.step.type === ScraperStepType.REDIRECT ? (
              <div className="flex flex-row items-center gap-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>{item.step.data.url}</TooltipContent>
                </Tooltip>
                <span className="flex-1 max-w-32 overflow-hidden whitespace-nowrap text-ellipsis">
                  {item.step.data.url}
                </span>
              </div>
            ) : (
              <span>TODO: value query</span>
            )}
          </div>
        )}
      </div>
      {(onEdit || onDelete) && (
        <div
          className={cn(
            'flex flex-col justify-center items-center border-l',
            item.type === ExecutionItemType.CONDITION && 'border-execution-condition',
            item.type === ExecutionItemType.STEP && 'border-execution-step',
          )}
        >
          {onEdit && (
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'flex-1 rounded-none',
                    item.type === ExecutionItemType.CONDITION && 'hover:bg-execution-condition/50',
                    item.type === ExecutionItemType.STEP && 'hover:bg-execution-step/50',
                  )}
                >
                  <Pencil />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-screen">
                <DialogHeader>
                  <DialogTitle>
                    <DynamicIcon
                      name={executionItemTypeNames[item.type].iconName}
                      className="size-7 inline"
                    />
                    &nbsp;
                    {executionItemTypeNames[item.type].label}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Fill the form to edit a <b>{executionItemTypeNames[item.type].label}</b>
                </DialogDescription>
                <ExecutionItemForm
                  item={item}
                  onSubmitSuccess={handleEditSuccess}
                  className="mt-4"
                  maxTargetExecutionItemIndex={executionLength - 1}
                />
              </DialogContent>
            </Dialog>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className={cn(
                'flex-1 rounded-none',
                item.type === ExecutionItemType.CONDITION && 'hover:bg-execution-condition/50',
                item.type === ExecutionItemType.STEP && 'hover:bg-execution-step/50',
              )}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ExecutionItemHeader({ type, index }: { type: ExecutionItemType; index: number }) {
  return (
    <div className="flex flex-row items-center justify-start gap-x-2 px-2 bg-black/10 dark:bg-black/20">
      <span className="font-base font-bold">{index}</span>
      <Separator
        orientation="vertical"
        className={cn(
          'h-auto self-stretch',
          type === ExecutionItemType.CONDITION && 'bg-execution-condition/50',
          type === ExecutionItemType.STEP && 'bg-execution-step/50',
        )}
      />
      <Badge
        variant="default"
        className={cn(
          'gap-x-1 my-1',
          type === ExecutionItemType.CONDITION &&
            'bg-execution-condition text-execution-condition-foreground',
          type === ExecutionItemType.STEP && 'bg-execution-step text-execution-step-foreground',
        )}
      >
        <DynamicIcon name={executionItemTypeNames[type].iconName} className="size-4" />
        {executionItemTypeNames[type].label}
      </Badge>
    </div>
  )
}
