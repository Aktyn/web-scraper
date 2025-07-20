import { Button } from "@/components/shadcn/button"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { Switch } from "@/components/shadcn/switch"
import { useGet } from "@/hooks/api/useGet"
import { usePut } from "@/hooks/api/usePut"
import { useMounted } from "@/hooks/useMounted"
import type { ColumnDef } from "@tanstack/react-table"
import type { Status, UserPreferences } from "@web-scraper/common"
import { defaultPreferences } from "@web-scraper/common"
import { CheckIcon, EditIcon, Save, TriangleAlert, XIcon } from "lucide-react"
import type { RefObject } from "react"
import { useImperativeHandle, useMemo, useState } from "react"
import { NullBadge } from "../common/null-badge.js"
import { DataTable } from "../common/table/data-table.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip.js"

type PreferenceKey = UserPreferences[number]["key"]

export interface PreferencesTableInterface {
  refetch: () => void
}

export function PreferencesTable({
  ref,
}: {
  ref?: RefObject<PreferencesTableInterface | null>
}) {
  const { data: userPreferences, isLoading, refetch } = useGet("/preferences")
  const { data: status, isLoading: isStatusLoading } = useGet("/status")

  useImperativeHandle(
    ref,
    () => ({
      refetch,
    }),
    [refetch],
  )

  const preferences = useMemo(() => {
    return Object.entries(defaultPreferences).map(
      ([key, { value, description }]) => ({
        key: key as PreferenceKey,
        value: (userPreferences?.data.find((p) => p.key === key)?.value ??
          value) as Required<unknown>,
        description,
      }),
    )
  }, [userPreferences?.data])

  const columns = useMemo<
    ColumnDef<
      UserPreferences[number] & {
        description: string | null
      }
    >[]
  >(
    () => [
      {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            {status && !isAvailable(row.original.key, status.data) && (
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="size-4 text-warning inline" />
                </TooltipTrigger>
                <TooltipContent>Feature not available</TooltipContent>
              </Tooltip>
            )}
            {row.original.key}
          </div>
        ),
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
          <ValueCell preference={row.original} onValueChange={refetch} />
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="whitespace-normal text-muted-foreground text-pretty inline-block">
            {row.original.description ?? <NullBadge />}
          </span>
        ),
      },
    ],
    [refetch, status],
  )

  return (
    <DataTable
      data-transition-direction="left"
      className="view-transition delay-200 *:max-w-full overflow-hidden"
      columns={columns}
      data={preferences}
      isLoading={isLoading || isStatusLoading}
    />
  )
}

function isAvailable(key: PreferenceKey, status: Status) {
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (key) {
    case "localizationModel":
    case "localizationSystemPrompt":
      return status.ollamaInstalled && status.localizationModelAvailable
    case "navigationModel":
      return status.ollamaInstalled && status.navigationModelAvailable
    default:
      return true
  }

  return true
}

type ValueCellProps = {
  preference: {
    value: Required<unknown>
    key: string
  }
  onValueChange: (newValue: Required<unknown>) => void
}

function ValueCell({ preference, onValueChange }: ValueCellProps) {
  const { value, key } = preference

  const { putItem } = usePut("/preferences/:key")
  const [open, setOpen] = useState(false)

  const mounted = useMounted()

  const handleChange = async (newValue: Required<unknown>) => {
    await putItem({ value: newValue }, { key })

    if (mounted.current) {
      onValueChange(newValue)
      setOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-pretty max-h-64 overflow-y-auto">
        {typeof value === "boolean" ? (
          <span className="flex items-center gap-1 font-medium">
            {value ? (
              <CheckIcon className="size-4 text-success" />
            ) : (
              <XIcon className="size-4 text-destructive" />
            )}
            {value ? "True" : "False"}
          </span>
        ) : typeof value === "string" ? (
          value || <NullBadge />
        ) : typeof value === "number" ? (
          value
        ) : (
          JSON.stringify(value)
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost">
            <EditIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
          {typeof value === "boolean" ? (
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor={key}>
                Toggle <b>{key}</b>
              </Label>
              <Switch
                id={key}
                defaultChecked={value}
                onCheckedChange={handleChange}
              />
            </div>
          ) : typeof value === "string" ? (
            <StringValueCell
              valueKey={key}
              value={value}
              onValueChange={handleChange}
            />
          ) : typeof value === "number" ? (
            <NumberValueCell
              valueKey={key}
              value={value}
              onValueChange={handleChange}
            />
          ) : (
            <Label>Not supported</Label>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

type StringValueCellProps = {
  valueKey: string
  value: string
  onValueChange: (newValue: string) => void
}

function StringValueCell({
  valueKey,
  value,
  onValueChange,
}: StringValueCellProps) {
  const [inputValue, setInputValue] = useState(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <Label htmlFor={valueKey} className="gap-1">
        <span>Set</span>
        <b>{valueKey}</b>
      </Label>
      <Input
        id={valueKey}
        value={inputValue}
        className="w-md"
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onValueChange(inputValue)
          }
        }}
      />
      <Button
        variant="default"
        size="sm"
        onClick={() => onValueChange(inputValue)}
      >
        <Save />
        Save
      </Button>
    </div>
  )
}

type NumberValueCellProps = {
  valueKey: string
  value: number
  onValueChange: (newValue: number) => void
}

function NumberValueCell({
  valueKey,
  value,
  onValueChange,
}: NumberValueCellProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleSave = () => {
    const numericValue = Number.parseInt(inputValue, 10)
    if (!Number.isNaN(numericValue)) {
      onValueChange(numericValue)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Label htmlFor={valueKey} className="gap-1">
        <span>Set</span>
        <b>{valueKey}</b>
      </Label>
      <Input
        id={valueKey}
        type="number"
        value={inputValue}
        className="w-md"
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSave()
          }
        }}
      />
      <Button variant="default" size="sm" onClick={handleSave}>
        <Save />
        Save
      </Button>
    </div>
  )
}
