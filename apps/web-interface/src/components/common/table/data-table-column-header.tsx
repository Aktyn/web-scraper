import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { Tooltip, TooltipContent } from "@/components/shadcn/tooltip"
import { cn } from "@/lib/utils"
import { TooltipTrigger } from "@radix-ui/react-tooltip"
import type { Column } from "@tanstack/react-table"
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Funnel,
  X,
} from "lucide-react"
import { useState, type ComponentProps, type ReactNode } from "react"
import { DateTimePicker } from "../form/datetime-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"

enum FilterType {
  Text = 1,
  Number,
  Date,
  Select,
}

interface DataTableColumnHeaderProps<TData, TValue, Type extends FilterType>
  extends Omit<ComponentProps<"div">, "title"> {
  column: Column<TData, TValue>
  title: ReactNode
  filterType?: Type
  onFilterChange?: FilterChangeCallback<Type>
  options?: { label: string; value: string }[]
}

export function DataTableColumnHeader<TData, TValue, Type extends FilterType>({
  column,
  title,
  filterType,
  onFilterChange,
  options,
  ...divProps
}: DataTableColumnHeaderProps<TData, TValue, Type>) {
  const [filterValue, setFilterValue] = useState<FilterValueType<Type> | null>(
    null,
  )

  const handleFilterChange = (value: FilterValueType<Type> | null) => {
    setFilterValue(value)
    onFilterChange?.(value)
  }

  if (!column.getCanSort()) {
    return <div {...divProps}>{title}</div>
  }

  return (
    <div
      {...divProps}
      className={cn("flex items-center gap-x-2", divProps.className)}
    >
      <span>{title}</span>
      <div className="flex items-center gap-x-1">
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="in-data-[sorting]:text-accent not-in-data-sorting:opacity-80 hover:opacity-100"
              tabIndex={-1}
              onClick={() => {
                const sortState = column.getIsSorted()

                if (sortState === "desc") {
                  column.toggleSorting(false, false)
                } else if (sortState === "asc") {
                  column.clearSorting()
                } else {
                  column.toggleSorting(true, false)
                }
              }}
            >
              <ArrowDownWideNarrow className="hidden in-data-[sorting=true]:inline" />
              <ArrowUpNarrowWide className="hidden in-data-[sorting=false]:inline" />
              <ArrowUpDown className="in-data-[sorting]:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sorting</TooltipContent>
        </Tooltip>
        {!!filterType && onFilterChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                tabIndex={-1}
                className={cn(
                  "opacity-80 hover:opacity-100",
                  !!filterValue && "text-accent",
                )}
              >
                <Funnel />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2 rounded-xl w-auto">
              <div className="flex items-center gap-2">
                <Filter
                  type={filterType}
                  value={filterValue}
                  onChange={handleFilterChange}
                  options={options}
                />
                <Tooltip disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      tabIndex={-1}
                      className="ml-auto"
                      onClick={() => handleFilterChange(null)}
                    >
                      <X />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear filter</TooltipContent>
                </Tooltip>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}

DataTableColumnHeader.FilterType = FilterType

type RangeFilter<BaseType> = {
  from?: BaseType
  to?: BaseType
}

type FilterValueType<Type extends FilterType> = Type extends FilterType.Text
  ? string
  : Type extends FilterType.Number
    ? RangeFilter<number>
    : Type extends FilterType.Select
      ? string
      : RangeFilter<number>

type FilterChangeCallback<Type extends FilterType> = (
  value: FilterValueType<Type> | null,
) => void

type FilterProps<Type extends FilterType> = {
  type: Type
  value: FilterValueType<Type> | null
  onChange: FilterChangeCallback<Type>
  options?: { label: string; value: string }[]
}

function Filter<Type extends FilterType>({
  type,
  value,
  onChange,
  options,
}: FilterProps<Type>) {
  switch (type) {
    case FilterType.Text:
      return (
        <Input
          placeholder="Type here..."
          value={(value as string) ?? ""}
          autoFocus
          onChange={(event) =>
            onChange(event.target.value as FilterValueType<Type>)
          }
          className="max-w-sm"
        />
      )
    case FilterType.Number:
      return (
        <div className="w-full flex flex-row items-center gap-2 *:[input]:flex-1">
          <Input
            type="number"
            placeholder="From"
            value={(value as RangeFilter<number>)?.from ?? ""}
            onChange={(event) =>
              onChange({
                ...(value as RangeFilter<number>),
                from: event.target.valueAsNumber,
              } as FilterValueType<Type>)
            }
            className="max-w-24"
          />
          <span className="text-muted-secondary">-</span>
          <Input
            type="number"
            placeholder="To"
            value={(value as RangeFilter<number>)?.to ?? ""}
            onChange={(event) =>
              onChange({
                ...(value as RangeFilter<number>),
                to: event.target.valueAsNumber,
              } as FilterValueType<Type>)
            }
            className="max-w-24"
          />
        </div>
      )
    case FilterType.Date: {
      const { from, to } = (value ?? {
        from: undefined,
        to: undefined,
      }) as RangeFilter<number>

      return (
        <div className="w-full flex flex-row items-center gap-2 *:[button]:flex-1 *:[button]:min-w-40">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {from ? new Date(from).toLocaleDateString() : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-xl">
              <DateTimePicker
                value={
                  (value as RangeFilter<number>)?.from
                    ? new Date(from ?? 0)
                    : null
                }
                onSelect={(date) =>
                  onChange({
                    ...(value as RangeFilter<number>),
                    from: date.getTime(),
                  } as FilterValueType<Type>)
                }
                onCancel={() =>
                  onChange({
                    ...(value as RangeFilter<number>),
                    from: undefined,
                  } as FilterValueType<Type>)
                }
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-secondary">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {to ? new Date(to).toLocaleDateString() : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-xl">
              <DateTimePicker
                value={to ? new Date(to ?? 0) : null}
                onSelect={(date) =>
                  onChange({
                    ...(value as RangeFilter<number>),
                    to: date.getTime(),
                  } as FilterValueType<Type>)
                }
                onCancel={() =>
                  onChange({
                    from,
                    to: undefined,
                  } as FilterValueType<Type>)
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      )
    }
    case FilterType.Select: {
      return (
        <Select
          value={(value as string) ?? ""}
          onValueChange={(value) => onChange(value as FilterValueType<Type>)}
        >
          <SelectTrigger className="min-w-48">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  }
}
