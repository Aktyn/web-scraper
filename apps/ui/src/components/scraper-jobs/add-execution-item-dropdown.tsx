import Icon from '@mdi/react'
import { ExecutionItemType, type UpsertScraperJobSchema } from '@web-scraper/common'
import { memo, type PropsWithChildren, useCallback, useState } from 'react'
import { executionItemTypeNames } from '~/lib/dictionaries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ExecutionItemForm } from './execution-item-form'

type AddExecutionItemDropdownProps = PropsWithChildren<{
  execution: UpsertScraperJobSchema['execution']
  onChange: (execution: UpsertScraperJobSchema['execution']) => void
  pushAfter?: number
}>

export const AddExecutionItemDropdown = memo<AddExecutionItemDropdownProps>(
  ({ children: trigger, execution, onChange, pushAfter }) => {
    const [addExecutionItemDropdownOpen, setAddExecutionItemDropdownOpen] = useState(false)

    const handleExecutionItemSubmitSuccess = useCallback(
      (executionItem: UpsertScraperJobSchema['execution'][number]) => {
        if (pushAfter !== undefined) {
          onChange([...execution.slice(0, pushAfter), executionItem, ...execution.slice(pushAfter)])
        } else {
          onChange([...execution, executionItem])
        }
        setAddExecutionItemDropdownOpen(false)
      },
      [execution, onChange, pushAfter],
    )

    return (
      <DropdownMenu
        open={addExecutionItemDropdownOpen}
        onOpenChange={setAddExecutionItemDropdownOpen}
      >
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuGroup>
            {Object.values(ExecutionItemType).map((value) => (
              <Dialog key={value} onOpenChange={setAddExecutionItemDropdownOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-base"
                    onSelect={(event) => event.preventDefault()}
                  >
                    <Icon path={executionItemTypeNames[value].svgPath} />
                    {executionItemTypeNames[value].label}
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      <Icon
                        path={executionItemTypeNames[value].svgPath}
                        className="size-7 inline"
                      />
                      &nbsp;
                      {executionItemTypeNames[value].label}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Fill the form to add a <b>{executionItemTypeNames[value].label}</b> to the
                    execution list
                  </DialogDescription>
                  <ExecutionItemForm
                    item={value}
                    onSubmitSuccess={handleExecutionItemSubmitSuccess}
                    className="mt-4"
                    maxTargetExecutionItemIndex={execution.length - 1}
                  />
                </DialogContent>
              </Dialog>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
)

AddExecutionItemDropdown.displayName = 'AddExecutionItemDropdown'
