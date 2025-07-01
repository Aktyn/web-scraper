import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form"
import { Input } from "@/components/shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select"
import { useGet } from "@/hooks/api/useGet"
import type { ScraperType } from "@web-scraper/common"
import { Loader2 } from "lucide-react"
import { useMemo, useState, type ComponentProps } from "react"
import {
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

type FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label?: string
  placeholder?: string
  description?: string
  disabled?: boolean
  className?: string
  selectProps?: ComponentProps<typeof Select>
}

export function FormScraperSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label = "Scraper",
  placeholder = "Select scraper",
  description,
  disabled,
  className,
  selectProps,
}: FormSelectProps<TFieldValues, TName>) {
  const scraperId: ScraperType["id"] | undefined = useWatch({
    control,
    name,
  })

  const [search, setSearch] = useState("")

  const { data: scrapersResponse, isLoading: isLoadingScrapers } = useGet(
    "/scrapers",
    undefined,
    { name: search, pageSize: 16 },
  )
  const { data: scraperData, isLoading: isScraperDataLoading } = useGet(
    scraperId ? "/scrapers/:id" : null,
    scraperId
      ? {
          id: scraperId,
        }
      : undefined,
  )
  const selectedScraper =
    scraperId && !isScraperDataLoading && scraperData?.data
      ? scraperData.data
      : scrapersResponse?.data?.find((s) => s.id === scraperId)

  const scrapers = scrapersResponse?.data

  const scraperOptions = useMemo(
    () =>
      scrapers?.map((s) => ({
        value: s.id.toString(),
        label: s.name,
      })) ?? [],
    [scrapers],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            defaultValue={selectedScraper?.id.toString() ?? ""}
            disabled={disabled}
            {...selectProps}
            onValueChange={(value) => {
              if (selectProps?.onValueChange) {
                selectProps.onValueChange(value)
              }
              field.onChange(Number(value))
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
                {(isLoadingScrapers ||
                  (!scraperData && isScraperDataLoading)) && (
                  <Loader2 className="animate-spin ease-in-out ml-auto" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <Input
                ref={(element) => {
                  setTimeout(() => element?.focus(), 16)
                }}
                placeholder="Search scrapers"
                className="w-full mb-1"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (
                    e.key !== "ArrowDown" &&
                    e.key !== "ArrowUp" &&
                    e.key !== "Enter"
                  ) {
                    e.stopPropagation()
                  }
                }}
              />
              {selectedScraper && (
                <SelectItem
                  key={selectedScraper.id.toString()}
                  value={selectedScraper.id.toString()}
                  tabIndex={-1}
                >
                  {selectedScraper.name}
                </SelectItem>
              )}
              {scraperOptions.map(
                (option) =>
                  option.value !== selectedScraper?.id.toString() && (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      tabIndex={-1}
                    >
                      {option.label}
                    </SelectItem>
                  ),
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
