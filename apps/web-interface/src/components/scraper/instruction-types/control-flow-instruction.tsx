import { MapPin, Undo2 } from "lucide-react"
import type { ComponentProps } from "react"

type MarkerInstructionProps = {
  name: string
} & ComponentProps<"div">

//TODO: colorize matching markers and jump-points

export function MarkerInstruction({
  name,
  ...divProps
}: MarkerInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <MapPin className="size-4" />
        <span className="font-medium leading-none">Marker</span>
      </div>

      <span className="font-bold">{name}</span>
    </div>
  )
}

type JumpInstructionProps = {
  markerName: string
} & ComponentProps<"div">

export function JumpInstruction({
  markerName,
  ...divProps
}: JumpInstructionProps) {
  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Undo2 className="size-4" />
        <span className="font-medium leading-none">Jump</span>
      </div>

      <span className="font-bold">{markerName}</span>
    </div>
  )
}
