import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { useGet } from "@/hooks/api/useGet"
import { usePut } from "@/hooks/api/usePut"
import { CheckIcon, EditIcon, XIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { defaultPreferences } from "@web-scraper/common"
import { useMemo, useState } from "react"
import { NullBadge } from "../common/null-badge"
import { DataTable } from "../common/table/data-table"
import { Switch } from "../shadcn/switch"
import { Label } from "../shadcn/label"
import { useMounted } from "@/hooks/useMounted"

export function Preferences() {
  const { data: userPreferences, isLoading, refetch } = useGet("/preferences")

  const preferences = useMemo(() => {
    return Object.entries(defaultPreferences).map(
      ([key, { value, description }]) => ({
        key,
        value: (userPreferences?.data.find((p) => p.key === key)?.value ??
          value) as Required<unknown>,
        description,
      }),
    )
  }, [userPreferences?.data])

  const columns = useMemo<
    ColumnDef<{
      key: string
      value: Required<unknown>
      description: string | null
    }>[]
  >(
    () => [
      {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.key}</div>
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
          <span className="whitespace-normal text-muted-foreground">
            {row.original.description ?? <NullBadge />}
          </span>
        ),
      },
    ],
    [refetch],
  )

  return (
    <div className="size-full *:w-256 *:max-w-full">
      <DataTable
        data-transition-direction="left"
        className="view-transition delay-100"
        columns={columns}
        data={preferences}
        isLoading={isLoading}
      />
    </div>
  )
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
    <div className="flex items-center gap-4">
      {typeof value === "boolean" ? (
        <div className="flex items-center gap-1 font-medium">
          {value ? (
            <CheckIcon className="size-4 text-success" />
          ) : (
            <XIcon className="size-4 text-destructive" />
          )}
          {value ? "True" : "False"}
        </div>
      ) : (
        JSON.stringify(value)
      )}
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
          ) : (
            "Not supported"
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
