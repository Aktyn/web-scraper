import { mdiPencil, mdiTrashCan } from '@mdi/js'
import Icon from '@mdi/react'
import {
  ExecutionItemType,
  FlowActionType,
  type JobExecutionItem,
  type UpsertJobExecutionItemSchema,
} from '@web-scraper/common'
import { type HTMLAttributes, useCallback, useState } from 'react'
import { executionItemTypeNames, flowActionTypeNames } from '~/lib/dictionaries'
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
import { ExecutionItemForm } from './execution-item-form'
import { Separator } from '../ui/separator'

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
      {item.type === ExecutionItemType.CONDITION && (
        <div className="flex flex-col justify-between items-stretch">
          <ExecutionItemHeader type={item.type} index={index} />
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
        </div>
      )}
      {item.type === ExecutionItemType.STEP && <div>TODO: step item block</div>}
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
                  <Icon path={mdiPencil} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    <Icon
                      path={executionItemTypeNames[item.type].svgPath}
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
              <Icon path={mdiTrashCan} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ExecutionItemHeader({ type, index }: { type: ExecutionItemType; index: number }) {
  return (
    <div className="flex flex-row items-center justify-start gap-x-2 px-2 dark:bg-black/20">
      <span className="text-lg font-bold">{index}</span>
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
        <Icon path={executionItemTypeNames[type].svgPath} className="size-4" />
        {executionItemTypeNames[type].label}
      </Badge>
    </div>
  )
}
