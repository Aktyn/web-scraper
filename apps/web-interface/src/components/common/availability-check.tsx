import { useGet } from "@/hooks/api/useGet"
import { Ban } from "lucide-react"
import { useMemo } from "react"
import { Alert, AlertDescription, AlertTitle } from "../shadcn/alert"

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

  const isAvailable = useMemo(() => {
    if (isLoading || !status) {
      return true
    }

    switch (feature) {
      case AvailabilityCheckFeature.SmartClick:
        return (
          status.data.ollamaInstalled && status.data.localizationModelAvailable
        )
      case AvailabilityCheckFeature.AutonomousAgent:
        return (
          status.data.ollamaInstalled && status.data.navigationModelAvailable
        )
    }
  }, [feature, isLoading, status])

  if (isAvailable) {
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

const notAvailableMessages = {
  [AvailabilityCheckFeature.SmartClick]:
    "Smart click is not available because Ollama is not installed or the localization model is not available.\nPlease pull the model from Ollama first.",
  [AvailabilityCheckFeature.AutonomousAgent]:
    "Autonomous agent is not available because Ollama is not installed or the navigation model is not available.\nPlease pull the model from Ollama first.",
}
