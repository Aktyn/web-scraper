import {
  ElementSelectorType,
  PageActionType,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperValueType,
} from "@web-scraper/common"

export const instructionTypeLabels: {
  [key in ScraperInstructionType]: string
} = {
  [ScraperInstructionType.PageAction]: "Page action",
  [ScraperInstructionType.Condition]: "Condition",
  [ScraperInstructionType.SaveData]: "Save data",
  [ScraperInstructionType.SaveDataBatch]: "Save data batch",
  [ScraperInstructionType.DeleteData]: "Delete data",
  [ScraperInstructionType.Marker]: "Marker",
  [ScraperInstructionType.Jump]: "Jump",
}

export const scraperValueTypeLabels: { [key in ScraperValueType]: string } = {
  [ScraperValueType.Literal]: "Literal value",
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
  [ScraperInstructionsExecutionInfoType.Success]: "Success",
  [ScraperInstructionsExecutionInfoType.Error]: "Error",
}

export const pageActionTypeLabels: { [key in PageActionType]: string } = {
  [PageActionType.Navigate]: "Navigate",
  [PageActionType.Wait]: "Wait",
  [PageActionType.Click]: "Click",
  [PageActionType.Type]: "Type",
}

export const selectorTypeLabels: { [key in ElementSelectorType]: string } = {
  [ElementSelectorType.Query]: "CSS Query",
  [ElementSelectorType.TextContent]: "Text content",
  [ElementSelectorType.TagName]: "Tag name",
  [ElementSelectorType.Attributes]: "Attributes",
}
