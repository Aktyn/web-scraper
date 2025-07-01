import { Button } from "@/components/shadcn/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { DateTimePicker } from "../form/datetime-picker"

export function DateTimePickerButton({ name }: { name: string }) {
  const form = useFormContext<Record<string, unknown>>()

  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={popoverOpen}
          onClick={(event) => event.stopPropagation()}
          tabIndex={-1}
        >
          <Calendar />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-90!">
        <DateTimePicker
          value={form.getValues(name) as Date | null}
          onSelect={(date) => {
            form.setValue(name, date.getTime(), { shouldValidate: true })
            setPopoverOpen(false)
          }}
          onCancel={() => {
            setPopoverOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
