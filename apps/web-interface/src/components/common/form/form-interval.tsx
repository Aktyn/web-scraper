import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Input } from "@/components/shadcn/input"
import { Label } from "@/components/shadcn/label.js"
import { cn, formatDuration, timeUnits } from "@/lib/utils.js"
import { Repeat } from "lucide-react"
import type { FieldPathByValue } from "react-hook-form"
import { type FieldValues } from "react-hook-form"
import type { FormInputProps } from "./form-input.js"

type DurationFieldName<TFieldValues extends FieldValues> = FieldPathByValue<
  TFieldValues,
  number
>

export function FormInterval<
  TFieldValues extends FieldValues = FieldValues,
  TName extends
    DurationFieldName<TFieldValues> = DurationFieldName<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  className,
}: Pick<
  FormInputProps<TFieldValues, TName>,
  "control" | "name" | "label" | "description" | "className"
>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = typeof field.value === "number" ? field.value : 0

        const months = Math.floor(value / timeUnits.month)
        const days = Math.floor((value % timeUnits.month) / timeUnits.day)
        const hours = Math.floor((value % timeUnits.day) / timeUnits.hour)
        const minutes = Math.floor((value % timeUnits.hour) / timeUnits.minute)
        const seconds = Math.floor(
          (value % timeUnits.minute) / timeUnits.second,
        )

        const values: {
          [key in (typeof unitOptions)[number]["label"]]: number
        } = {
          months,
          days,
          hours,
          minutes,
          seconds,
        }

        return (
          <FormItem className={className}>
            <FormLabel className="flex items-center gap-1">
              {typeof value !== "string" && (
                <Repeat className="size-3.5 inline text-muted-foreground" />
              )}
              {label}
              {typeof value === "number" && (
                <span className="text-xs text-muted-foreground leading-none">
                  ({formatDuration(value)})
                </span>
              )}
            </FormLabel>
            <FormControl>
              <div
                className="mr-auto flex flex-row flex-wrap items-center justify-start gap-2 border border-border/50 rounded-lg bg-input/20 p-1.5"
                ref={field.ref}
              >
                {unitOptions.map((unit) => (
                  <div key={unit.label} className="flex flex-col items-start">
                    <Label className="text-xs capitalize text-muted-foreground">
                      {unit.label}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className={cn(
                        "w-16 transition-colors",
                        !values[unit.label] && "border-transparent",
                      )}
                      {...field}
                      ref={null}
                      value={values[unit.label]}
                      onChange={(event) => {
                        let numericValue = event.target.valueAsNumber
                        if (numericValue < 0 || isNaN(numericValue)) {
                          numericValue = 0
                        }

                        values[unit.label] = numericValue

                        const updatedValue = Object.entries(values).reduce(
                          (acc, [key, value]) => {
                            return (
                              acc +
                              value *
                                (unitOptions.find(
                                  (option) => option.label === key,
                                )?.multiplier ?? 0)
                            )
                          },
                          0,
                        )

                        field.onChange({
                          ...event,
                          target: {
                            value: Math.floor(updatedValue),
                          },
                        })
                      }}
                    />
                  </div>
                ))}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

const unitOptions = [
  { label: "months", multiplier: timeUnits.month },
  { label: "days", multiplier: timeUnits.day },
  { label: "hours", multiplier: timeUnits.hour },
  { label: "minutes", multiplier: timeUnits.minute },
  { label: "seconds", multiplier: timeUnits.second },
] as const
