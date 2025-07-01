import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Input } from "@/components/shadcn/input"
import type { SerializableRegex } from "@web-scraper/common"
import { Regex } from "lucide-react"
import type { ChangeEvent } from "react"
import type { ControllerRenderProps, FieldPathByValue } from "react-hook-form"
import { useWatch, type FieldValues } from "react-hook-form"
import type { FormInputProps } from "./form-input"

type RegexValue = string | SerializableRegex

type RegexFieldName<TFieldValues extends FieldValues> = FieldPathByValue<
  TFieldValues,
  RegexValue
>

export function FormRegex<
  TFieldValues extends FieldValues = FieldValues,
  TName extends RegexFieldName<TFieldValues> = RegexFieldName<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  className,
  endAdornment,
  inputProps,
}: Omit<FormInputProps<TFieldValues, TName>, "type">) {
  const value: RegexValue = useWatch({
    control,
    name,
  })

  const stringValue =
    typeof value === "string" || !value
      ? value
      : `/${value.source}/${value.flags}`

  const handleChange = (
    field: ControllerRenderProps<TFieldValues, TName>,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    let transformedValue: RegexValue = event.target.value

    const matchResult = transformedValue.match(/^\/(.*)\/([dgimsuvy]*)$/)
    if (matchResult && matchResult.length >= 3) {
      const [, source, flags] = matchResult
      transformedValue = { source, flags }
    }

    field.onChange({
      ...event,
      target: {
        value: transformedValue,
      },
    })
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-1">
            {typeof value !== "string" && (
              <Regex className="size-3.5 inline text-muted-foreground" />
            )}
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={stringValue ?? ""}
                {...inputProps}
                onChange={(event) => {
                  if (inputProps?.onChange) {
                    inputProps.onChange(event)
                  }
                  handleChange(field, event)
                }}
              />
              {endAdornment && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
                  {endAdornment}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
