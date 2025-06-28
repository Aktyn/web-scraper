import { useGet } from "@/hooks/api/useGet"
import { Ban } from "lucide-react"
import { useMemo } from "react"
import { Alert, AlertDescription, AlertTitle } from "../shadcn/alert"
import type { Status } from "@web-scraper/common"

enum AvailabilityCheckFeature {
  SmartClick = "smart-click",
  AutonomousAgent = "autonomous-agent",
}

type AvailabilityCheckProps = {
  feature: AvailabilityCheckFeature
  compact?: boolean
}

export function AvailabilityCheck({
  feature,
  compact,
}: AvailabilityCheckProps) {
  const { data: status, isLoading } = useGet("/status")

  const available = useMemo(() => {
    if (isLoading || !status) {
      return true
    }

    return isAvailable(feature, status.data)
  }, [feature, isLoading, status])

  if (available) {
    return null
  }

  return (
    <Alert variant="destructive">
      <Ban />
      <AlertTitle>Not available</AlertTitle>
      {!compact && (
        <AlertDescription className="whitespace-pre-wrap">
          {notAvailableMessages[feature]}
        </AlertDescription>
      )}
    </Alert>
  )
}

AvailabilityCheck.Feature = AvailabilityCheckFeature
AvailabilityCheck.isAvailable = isAvailable

const notAvailableMessages = {
  [AvailabilityCheckFeature.SmartClick]:
    "Smart click is not available because Ollama is not installed or the localization model is not available.\nPlease pull the model from Ollama first.",
  [AvailabilityCheckFeature.AutonomousAgent]:
    "Autonomous agent is not available because Ollama is not installed or the navigation model is not available.\nPlease pull the model from Ollama first.",
}

function isAvailable(feature: AvailabilityCheckFeature, status: Status) {
  switch (feature) {
    case AvailabilityCheckFeature.SmartClick:
      return status.ollamaInstalled && status.localizationModelAvailable
    case AvailabilityCheckFeature.AutonomousAgent:
      return status.ollamaInstalled && status.navigationModelAvailable
  }
}
