import {
  ElementSelectorType,
  ExecutionIteratorType,
  PageActionType,
  RoutineStatus,
  SchedulerType,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperValueType,
  SqliteConditionType,
  SystemActionType,
} from "@web-scraper/common"
import { Brain } from "lucide-react"
import type { ReactNode } from "react"

export const instructionTypeLabels: {
  [key in ScraperInstructionType]: ReactNode
} = {
  [ScraperInstructionType.PageAction]: "Page action",
  [ScraperInstructionType.Condition]: "Condition",
  [ScraperInstructionType.DeleteCookies]: "Delete cookies",
  [ScraperInstructionType.LogData]: (
    <div className="flex flex-row items-baseline gap-1">
      <span>Log data</span>
      <span className="text-muted-foreground text-xs leading-none">
        (useful in CLI)
      </span>
    </div>
  ),
  [ScraperInstructionType.SaveData]: "Save data",
  [ScraperInstructionType.SaveDataBatch]: "Save data batch",
  [ScraperInstructionType.DeleteData]: "Delete data",
  [ScraperInstructionType.Marker]: "Marker",
  [ScraperInstructionType.Jump]: "Jump",
  [ScraperInstructionType.SystemAction]: "System action",
}

export const scraperValueTypeLabels: { [key in ScraperValueType]: string } = {
  [ScraperValueType.Literal]: "Literal value",
  [ScraperValueType.Null]: "Null",
  [ScraperValueType.CurrentTimestamp]: "Current timestamp",
  [ScraperValueType.ExternalData]: "External data",
  [ScraperValueType.ElementTextContent]: "Element text content",
  [ScraperValueType.ElementAttribute]: "Element attribute",
}

export const scraperInstructionsExecutionInfoTypeLabels: {
  [key in ScraperInstructionsExecutionInfoType]: string
} = {
  [ScraperInstructionsExecutionInfoType.Instruction]: "Instruction",
  [ScraperInstructionsExecutionInfoType.ExternalDataOperation]:
    "External data operation",
  [ScraperInstructionsExecutionInfoType.PageOpened]: "Page opened",
  [ScraperInstructionsExecutionInfoType.Success]: "Success",
  [ScraperInstructionsExecutionInfoType.Error]: "Error",
}

export const pageActionTypeLabels: { [key in PageActionType]: ReactNode } = {
  [PageActionType.Navigate]: "Navigate",
  [PageActionType.Wait]: "Wait",
  [PageActionType.Click]: "Click",
  [PageActionType.SmartClick]: (
    <div className="flex flex-row items-center gap-1">
      <span>Smart click</span>
      <span className="text-muted-foreground text-xs leading-none">
        (<Brain className="size-3.5 inline" /> AI feature)
      </span>
    </div>
  ),
  [PageActionType.Type]: "Type",
  [PageActionType.ScrollToBottom]: "Scroll to bottom",
  [PageActionType.ScrollToTop]: "Scroll to top",
  [PageActionType.ScrollToElement]: "Scroll to element",
  [PageActionType.Evaluate]: "Evaluate",
  [PageActionType.RunAutonomousAgent]: (
    <div className="flex flex-row items-center gap-1">
      <span>Run autonomous agent</span>
      <span className="text-muted-foreground text-xs leading-none">
        (<Brain className="size-3.5 inline" /> AI feature)
      </span>
    </div>
  ),
}

export const selectorTypeLabels: { [key in ElementSelectorType]: string } = {
  [ElementSelectorType.Query]: "CSS Query",
  [ElementSelectorType.TextContent]: "Text content",
  [ElementSelectorType.TagName]: "Tag name",
  [ElementSelectorType.Attributes]: "Attributes",
}

export const executionIteratorTypeLabels: {
  [key in ExecutionIteratorType]: string
} = {
  [ExecutionIteratorType.Range]: "Range",
  [ExecutionIteratorType.EntireSet]: "Entire set",
  [ExecutionIteratorType.FilteredSet]: "Filtered set",
}

export const conditionLabels: { [key in SqliteConditionType]: string } = {
  [SqliteConditionType.Equals]: "Equals",
  [SqliteConditionType.NotEquals]: "Not Equals",
  [SqliteConditionType.GreaterThan]: "Greater Than",
  [SqliteConditionType.GreaterThanOrEqual]: "Greater Than or Equal",
  [SqliteConditionType.LessThan]: "Less Than",
  [SqliteConditionType.LessThanOrEqual]: "Less Than or Equal",
  [SqliteConditionType.Like]: "Like",
  [SqliteConditionType.NotLike]: "Not Like",
  [SqliteConditionType.ILike]: "Case-insensitive Like",
  [SqliteConditionType.NotILike]: "Case-insensitive Not Like",
  [SqliteConditionType.In]: "In",
  [SqliteConditionType.NotIn]: "Not In",
  [SqliteConditionType.IsNull]: "Is Null",
  [SqliteConditionType.IsNotNull]: "Is Not Null",
  [SqliteConditionType.Between]: "Between",
  [SqliteConditionType.NotBetween]: "Not Between",
}

export const systemActionTypeLabels: { [key in SystemActionType]: string } = {
  [SystemActionType.ShowNotification]: "Show notification",
  [SystemActionType.ExecuteSystemCommand]: "Execute system command",
}

export const routineStatusLabels: { [key in RoutineStatus]: string } = {
  [RoutineStatus.Active]: "Active",
  [RoutineStatus.Executing]: "Executing",
  [RoutineStatus.Paused]: "Paused",
  [RoutineStatus.PausedDueToMaxNumberOfFailedExecutions]:
    "Paused due to max number of failed executions",
}

export const schedulerTypeLabels: { [key in SchedulerType]: string } = {
  [SchedulerType.Interval]: "Interval",
}
