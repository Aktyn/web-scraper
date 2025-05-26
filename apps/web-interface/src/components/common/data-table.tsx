"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/shadcn/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "../shadcn/scroll-area"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
} & ComponentProps<"div">

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  ...containerProps
}: DataTableProps<TData, TValue>) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const scrollPositionRef = useRef(0)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    setShowBackToTop(scrollTop > clientHeight * 2)

    if (hasMore && !isLoading && onLoadMore && scrollTop + clientHeight >= scrollHeight - 100) {
      onLoadMore()
    }

    scrollPositionRef.current = scrollTop
  }, [hasMore, isLoading, onLoadMore])

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <div {...containerProps} className={cn("relative w-full h-full", containerProps.className)}>
      <ScrollArea ref={containerRef} className="max-h-full">
        <Table ref={tableRef}>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="p-4 text-center font-bold text-muted-foreground pointer-events-none"
                >
                  {isLoading ? "Loading..." : "No results"}
                </TableCell>
              </TableRow>
            )}
            {isLoading && data.length > 0 && (
              <TableRow className="animate-in fade-in">
                <TableCell colSpan={columns.length} className="h-16 text-center">
                  Loading more...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 z-20 rounded-full pr-4!"
          size="sm"
          variant="outline"
        >
          <ChevronUp />
          <span>Back to top</span>
        </Button>
      )}
    </div>
  )
}
