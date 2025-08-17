"use client"

import { Button } from "@/components/shadcn/button"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table"
import { cn } from "@/lib/utils"
import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronUp } from "lucide-react"
import type { ReactNode } from "react"
import {
  type ComponentProps,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { ScrollArea, ScrollBar } from "../../shadcn/scroll-area"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  hasMore?: boolean
  getRowCanExpand?: (row: Row<TData>) => boolean
  SubComponent?: (props: { row: Row<TData> }) => ReactNode
  onLoadMore?: () => void
  onRowClick?: (row: Row<TData>) => void
  tableProps?: ComponentProps<"table">
  noDataMessage?: ReactNode
} & ComponentProps<"div">

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  hasMore = false,
  getRowCanExpand,
  SubComponent,
  onLoadMore,
  onRowClick,
  tableProps,
  noDataMessage = "No results",
  ...containerProps
}: DataTableProps<TData, TValue>) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)

  const expandable = !!SubComponent

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: getRowCanExpand ?? (SubComponent ? () => true : undefined),
  })

  const handleScroll = useCallback(() => {
    if (!viewportRef.current) return

    const container = viewportRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    setShowBackToTop(
      scrollTop > clientHeight * 2 && scrollTop < scrollHeight - clientHeight,
    )

    if (
      hasMore &&
      !isLoading &&
      onLoadMore &&
      scrollTop + clientHeight >= scrollHeight - 100
    ) {
      onLoadMore()
    }

    scrollPositionRef.current = scrollTop
  }, [hasMore, isLoading, onLoadMore])

  const scrollToTop = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const viewport = scrollArea.querySelector<HTMLDivElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) return

    viewportRef.current = viewport
    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (!hasMore || isLoading || !onLoadMore) return

    const viewport = viewportRef.current
    if (!viewport) return

    const timeoutId = setTimeout(() => {
      if (viewport.scrollHeight <= viewport.clientHeight) {
        onLoadMore()
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [data, hasMore, isLoading, onLoadMore])

  const handleRowClick = useCallback(
    (row: Row<TData>) => {
      if (expandable) {
        row.toggleExpanded()
      }

      if (onRowClick) {
        onRowClick(row)
      }
    },
    [onRowClick, expandable],
  )

  return (
    <div
      {...containerProps}
      className={cn("relative w-full h-full", containerProps.className)}
    >
      <ScrollArea ref={scrollAreaRef} className="max-h-full grid grid-rows-1">
        <table {...tableProps}>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-inherit">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-expanded={!!expanded[index as never]}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => handleRowClick?.(row)}
                    className={cn(
                      SubComponent &&
                        row.getIsExpanded() &&
                        "border-b-transparent",
                      onRowClick || expandable
                        ? "not-disabled:cursor-pointer"
                        : "hover:bg-inherit",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {SubComponent && row.getIsExpanded() && (
                    <TableRow className="cursor-default">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0"
                      >
                        <SubComponent row={row} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="p-4 text-center font-bold text-muted-foreground pointer-events-none"
                >
                  {isLoading ? "Loading..." : noDataMessage}
                </TableCell>
              </TableRow>
            )}
            {isLoading && data.length > 0 && (
              <TableRow className="animate-in fade-in">
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-muted-foreground"
                >
                  Loading more...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Button
        onClick={scrollToTop}
        className={cn(
          "absolute bottom-4 right-4 z-20 rounded-full pr-4! backdrop-blur-sm transition-[opacity,translate]",
          showBackToTop
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-4",
        )}
        size="sm"
        variant="outline"
      >
        <ChevronUp />
        <span>Back to top</span>
      </Button>
    </div>
  )
}
