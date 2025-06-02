import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Input } from "@/components/shadcn/input"
import type { ComponentProps, ReactNode } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label: ReactNode
  placeholder?: string
  description?: string
  type?: string
  disabled?: boolean
  className?: string
  endAdornment?: ReactNode
  inputProps?: Partial<ComponentProps<typeof Input>>
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled,
  className,
  endAdornment,
  inputProps,
}: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={field.value?.toString() ?? ""}
                {...inputProps}
                onChange={(event) => {
                  if (inputProps?.onChange) {
                    inputProps.onChange(event)
                  }
                  if (type === "number") {
                    field.onChange({
                      ...event,
                      target: {
                        value: event.target.value && Number(event.target.value),
                      },
                    })
                  } else {
                    field.onChange(event)
                  }
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
