import {
  ElementSelectorType,
  ExecutionIteratorType,
  PageActionType,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperValueType,
  SqliteConditionType,
  SystemActionType,
} from "@web-scraper/common"

export const instructionTypeLabels: {
  [key in ScraperInstructionType]: string
} = {
  [ScraperInstructionType.PageAction]: "Page action",
  [ScraperInstructionType.Condition]: "Condition",
  [ScraperInstructionType.DeleteCookies]: "Delete cookies",
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

export const pageActionTypeLabels: { [key in PageActionType]: string } = {
  [PageActionType.Navigate]: "Navigate",
  [PageActionType.Wait]: "Wait",
  [PageActionType.Click]: "Click",
  [PageActionType.Type]: "Type",
  [PageActionType.ScrollToBottom]: "Scroll to bottom",
  [PageActionType.ScrollToTop]: "Scroll to top",
  [PageActionType.ScrollToElement]: "Scroll to element",
  [PageActionType.Evaluate]: "Evaluate",
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
}
