import { Button } from "@/components/shadcn/button"
import { Calendar } from "@/components/shadcn/calendar"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label"
import { Separator } from "@/components/shadcn/separator"
import { formatDateTime } from "@/lib/utils"
import {
  isValid,
  startOfDay,
  getHours,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns"
import { useId, useMemo, useState } from "react"

type DateTimePickerProps = {
  value: Date | null
  onSelect: (date: Date) => void
  onCancel: () => void
}

export function DateTimePicker({
  value,
  onSelect,
  onCancel,
}: DateTimePickerProps) {
  const id = useId()

  const valueAsDate = useMemo(() => (value ? new Date(value) : null), [value])
  const originalTimezoneOffset = valueAsDate
    ? valueAsDate.getTimezoneOffset()
    : new Date().getTimezoneOffset()

  const [day, setDay] = useState<Date | undefined>(
    valueAsDate ? startOfDay(valueAsDate) : undefined,
  )
  const [hour, setHour] = useState(valueAsDate ? getHours(valueAsDate) : 0)
  const [minute, setMinute] = useState(
    valueAsDate ? getMinutes(valueAsDate) : 0,
  )
  const [second, setSecond] = useState(
    valueAsDate ? getSeconds(valueAsDate) : 0,
  )

  const combinedDate = useMemo(() => {
    if (!day) {
      return null
    }

    let result = startOfDay(day)
    result = setHours(result, Math.min(hour, 23))
    result = setMinutes(result, Math.min(minute, 59))
    result = setSeconds(result, Math.min(second, 59))

    if (valueAsDate) {
      const currentOffset = result.getTimezoneOffset()
      const offsetDifference = currentOffset - originalTimezoneOffset
      result = new Date(result.getTime() - offsetDifference * 60 * 1000)
    }

    return result
  }, [day, hour, minute, second, originalTimezoneOffset, valueAsDate])

  return (
    <div className="flex flex-col items-center">
      <Calendar
        mode="single"
        onSelect={setDay}
        selected={day}
        classNames={{
          day_today: "text-accent font-bold!",
        }}
      />
      <div className="flex flex-col items-stretch max-w-48 mx-auto gap-y-2 p-2 pt-0">
        <div className="flex flex-row flex-wrap items-center justify-center gap-x-2 *:[input]:flex-1">
          <div className="flex flex-row items-center justify-center gap-2 w-full">
            <Label htmlFor={`${id}-hour`}>Hour</Label>
            <span>:</span>
            <Label htmlFor={`${id}-minute`}>Minute</Label>
          </div>
          <Input
            id={`${id}-hour`}
            name="hour"
            type="number"
            maxLength={2}
            min={0}
            max={23}
            className="text-right"
            placeholder="Hour"
            value={formatTimeNumber(hour, 23)}
            onChange={(event) =>
              setHour(Number(formatTimeNumber(event.target.valueAsNumber, 23)))
            }
          />
          <span>:</span>
          <Input
            id={`${id}-minute`}
            name="minute"
            type="number"
            maxLength={2}
            min={0}
            max={59}
            placeholder="Minute"
            value={formatTimeNumber(minute, 59)}
            onChange={(event) =>
              setMinute(
                Number(formatTimeNumber(event.target.valueAsNumber, 59)),
              )
            }
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-y-1">
          <Label htmlFor={`${id}-second`}>Seconds</Label>
          <Input
            id={`${id}-second`}
            name="second"
            type="number"
            maxLength={2}
            min={0}
            max={59}
            className="text-center"
            placeholder="Second"
            value={formatTimeNumber(second, 59)}
            onChange={(event) =>
              setSecond(
                Number(formatTimeNumber(event.target.valueAsNumber, 59)),
              )
            }
          />
        </div>
      </div>
      <Separator />
      {combinedDate && isValid(combinedDate) && (
        <div className="text-sm text-muted-foreground text-center p-2 pt-3">
          {formatDateTime(combinedDate)}
        </div>
      )}
      <div className="flex flex-row items-center justify-center gap-2 p-2 *:flex-1 w-full">
        <Button
          variant="outline"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!combinedDate}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (combinedDate) {
              onSelect(combinedDate)
            }
          }}
        >
          Confirm
        </Button>
      </div>
    </div>
  )
}

function formatTimeNumber(value: number, max: number) {
  const twoDigitsString = value.toString().slice(-2).padStart(2, "0")
  return Math.min(max, Number(twoDigitsString)).toString().slice(-2)
}
