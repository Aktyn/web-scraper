import { useGet } from "@/hooks/api/useGet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../shadcn/table"
import { Button } from "../shadcn/button"
import { Pencil } from "lucide-react"
import { Skeleton } from "../shadcn/skeleton"

export function Preferences() {
  const { data: preferences, isLoading } = useGet("/preferences")

  return (
    <div data-transition-direction="top" className="view-transition size-full">
      <Table className="w-96 max-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : (
            preferences?.data.map((preference) => (
              <TableRow key={preference.key}>
                <TableCell>{preference.key}</TableCell>
                <TableCell>
                  <div className="w-full flex flex-row items-center gap-2">
                    <span>{preference.value}</span>
                    <Button variant="outline" size="icon" className="ml-auto" disabled>
                      <Pencil />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-full h-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-full h-4" />
      </TableCell>
    </TableRow>
  )
}
