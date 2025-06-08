import { Code } from "@/components/common/code"
import { FormInput } from "@/components/common/form/form-input"
import { FormSelect } from "@/components/common/form/form-select"
import { LabeledValue } from "@/components/common/labeled-value"
import { Button } from "@/components/shadcn/button"
import { conditionLabels } from "@/lib/dictionaries"
import type { ExecutionIterator } from "@web-scraper/common"
import {
  runUnsafe,
  SqliteColumnType,
  SqliteConditionType,
  whereSchemaToSql,
  type CreateScraper,
  type UserDataStoreColumn,
} from "@web-scraper/common"
import { AlertTriangle, Plus, Trash2 } from "lucide-react"
import { Fragment, useMemo } from "react"
import type { Control } from "react-hook-form"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { mapToSelectOptions } from "./helpers"

type WhereSchemaFormProps = {
  columns: UserDataStoreColumn[]
} & (
  | {
      control: Control<CreateScraper>
      name: `dataSources.${number}.whereSchema`
      dataSourceIndex: number
    }
  | {
      control: Control<ExecutionIterator>
      name: "where"
    }
)

export function WhereSchemaForm({
  control: _control,
  name,
  columns,
}: WhereSchemaFormProps) {
  const control = _control as unknown as Control<
    CreateScraper | ExecutionIterator
  >

  const { setValue } = useFormContext<CreateScraper | ExecutionIterator>()
  const whereSchema = useWatch({ control, name })

  const sqlPreview = whereSchema
    ? runUnsafe(() => whereSchemaToSql(whereSchema))
    : null

  const addRoot = (type?: "and" | "or") => {
    if (type) {
      setValue(name, {
        [type as "and"]: [],
        negate: false,
      })
    } else {
      setValue(name, {
        column: "",
        condition: SqliteConditionType.Equals,
        value: "",
      })
    }
  }

  const clearSchema = () => {
    setValue(name, null)
  }

  if (!whereSchema) {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">WHERE Conditions (optional)</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add conditions to filter the data from this source.
          </p>
        </div>

        <AddRootButton addRoot={addRoot} />
      </div>
    )
  }

  const isLogicalGroup = "and" in whereSchema || "or" in whereSchema

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">WHERE Conditions</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSchema}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Clear All
        </Button>
      </div>

      {isLogicalGroup ? (
        <LogicalGroupForm
          control={control}
          name={name}
          columns={columns}
          onRemove={clearSchema}
          level={0}
        />
      ) : (
        <ConditionForm
          control={control}
          name={name}
          columns={columns}
          onRemove={clearSchema}
        />
      )}

      {sqlPreview && (
        <LabeledValue
          label="SQL Preview:"
          className="bg-card border rounded-md p-2"
        >
          <Code className="max-w-full text-pretty whitespace-pre-wrap">
            {sqlPreview}
          </Code>
        </LabeledValue>
      )}
    </div>
  )
}

type LogicalGroupFormProps = {
  control: Control<CreateScraper | ExecutionIterator>
  name: `dataSources.${number}.whereSchema` | "where"
  columns: UserDataStoreColumn[]
  onRemove: () => void
  level: number
}

function LogicalGroupForm({
  control,
  name,
  columns,
  onRemove,
  level,
}: LogicalGroupFormProps) {
  const { setValue } = useFormContext<CreateScraper | ExecutionIterator>()
  const group = useWatch({ control, name })

  const isLogicalGroup = group && ("and" in group || "or" in group)

  const groupType = isLogicalGroup ? ("and" in group ? "and" : "or") : "and"
  const items = isLogicalGroup ? ("and" in group ? group.and : group.or) : []

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.${groupType}`,
  })

  const addRoot = (type?: "and" | "or") => {
    if (type) {
      append({
        [type as "and"]: [],
        negate: false,
      })
    } else {
      append({
        column: "",
        condition: SqliteConditionType.Equals,
        value: "",
      })
    }
  }

  const toggleGroupType = () => {
    const newType = groupType === "and" ? "or" : "and"
    setValue(name, {
      [newType as "and"]: items,
      negate: isLogicalGroup ? group.negate : false,
    })
  }

  const toggleNegate = () => {
    if (!isLogicalGroup) {
      return
    }
    setValue(name, {
      ...group,
      negate: !group?.negate,
    })
  }

  if (!isLogicalGroup) {
    return null
  }

  if (level > 5) {
    return (
      <div className="border border-warning rounded-lg p-4 bg-warning/10 text-warning flex items-center gap-2">
        <AlertTriangle className="size-6" />
        <p className="text-sm text-balance">
          Maximum nesting level reached. Consider simplifying your conditions.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">
            {group.negate && "NOT "}
            {groupType.toUpperCase()} Group
          </h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleGroupType}
            className="text-xs"
          >
            Switch to {groupType === "and" ? "OR" : "AND"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleNegate}
            className="text-xs"
          >
            {group.negate ? "Remove NOT" : "Add NOT"}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <AddRootButton addRoot={addRoot} />

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No conditions added yet. Add a condition or logical group to get
          started.
        </p>
      )}

      <div className="flex flex-col gap-1">
        {fields.map((field, index) => {
          //Trick typescript to avoid depth limit in recursive types
          const fieldName = `${name}.${groupType}.${index}` as typeof name

          return (
            <LogicalGroupItem
              key={field.id}
              control={control}
              name={fieldName}
              columns={columns}
              remove={remove}
              index={index}
              groupType={groupType}
              level={level}
            />
          )
        })}
      </div>
    </div>
  )
}

function LogicalGroupItem({
  control,
  name,
  columns,
  remove,
  index,
  groupType,
  level,
}: Omit<LogicalGroupFormProps, "onRemove"> & {
  index: number
  groupType: "and" | "or"
  remove: (index: number) => void
}) {
  const item = useWatch({ control, name })
  const isLogicalGroup = item && ("and" in item || "or" in item)

  return (
    <Fragment>
      {index > 0 && (
        <div className="flex justify-center text-muted-foreground leading-none font-semibold text-xs">
          {groupType === "and" ? "AND" : "OR"}
        </div>
      )}
      {isLogicalGroup ? (
        <LogicalGroupForm
          control={control}
          name={name}
          columns={columns}
          onRemove={() => remove(index)}
          level={level + 1}
        />
      ) : (
        <ConditionForm
          control={control}
          name={name}
          columns={columns}
          onRemove={() => remove(index)}
        />
      )}
    </Fragment>
  )
}

const conditionOptions = mapToSelectOptions(conditionLabels)

type ConditionFormProps = {
  control: Control<CreateScraper | ExecutionIterator>
  name: `dataSources.${number}.whereSchema` | "where"
  columns: UserDataStoreColumn[]
  onRemove: () => void
}
//  & (
//   | {
//       control: Control<CreateScraper>
//       name: `dataSources.${number}.whereSchema`
//     }
//   | {
//       control: Control<ExecutionIterator>
//       name: "where"
//     }
// )

function ConditionForm({
  control,
  name,
  columns,
  onRemove,
}: ConditionFormProps) {
  const { setValue } = useFormContext<CreateScraper | ExecutionIterator>()
  const condition = useWatch({
    control,
    name: `${name}.condition`,
  })
  const selectedColumn = useWatch({
    control,
    name: `${name}.column`,
  })

  const columnType = useMemo(() => {
    const column = columns.find((col) => col.name === selectedColumn)
    return column?.type
  }, [columns, selectedColumn])

  const columnOptions = columns.map((col) => ({
    value: col.name,
    label: `${col.name} (${col.type})`,
  }))

  const needsValue =
    condition &&
    ![SqliteConditionType.IsNull, SqliteConditionType.IsNotNull].includes(
      condition,
    )
  const needsArrayValue =
    condition &&
    [SqliteConditionType.In, SqliteConditionType.NotIn].includes(condition)
  const needsRangeValue =
    condition &&
    [SqliteConditionType.Between, SqliteConditionType.NotBetween].includes(
      condition,
    )

  const inputType = useMemo(() => {
    if (!columnType) {
      return "text"
    }

    switch (columnType) {
      case SqliteColumnType.INTEGER:
      case SqliteColumnType.REAL:
      case SqliteColumnType.TIMESTAMP:
        return "number"
      case SqliteColumnType.BOOLEAN:
      case SqliteColumnType.TEXT:
      case SqliteColumnType.NUMERIC:
      case SqliteColumnType.BLOB:
      default:
        return "text"
    }
  }, [columnType])

  const getBooleanOptions = () => [
    { value: "true", label: "True" },
    { value: "false", label: "False" },
  ]

  const isBooleanColumn = columnType === SqliteColumnType.BOOLEAN

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium">Condition</h5>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          control={control}
          className="*:[button]:w-full"
          name={`${name}.column`}
          label="Column"
          placeholder="Select column"
          options={columnOptions}
          selectProps={{
            onValueChange: () => {
              if (
                condition === SqliteConditionType.Between ||
                condition === SqliteConditionType.NotBetween
              ) {
                setValue(`${name}.value`, { from: "", to: "" })
              } else if (
                condition === SqliteConditionType.In ||
                condition === SqliteConditionType.NotIn
              ) {
                setValue(`${name}.value`, [])
              } else {
                setValue(`${name}.value`, "")
              }
            },
          }}
        />

        <FormSelect
          control={control}
          className="*:[button]:w-full"
          name={`${name}.condition`}
          label="Condition"
          placeholder="Select condition"
          options={conditionOptions}
          selectProps={{
            onValueChange: (value) => {
              if (
                value === SqliteConditionType.Between ||
                value === SqliteConditionType.NotBetween
              ) {
                setValue(`${name}.value`, { from: "", to: "" })
              } else if (
                value === SqliteConditionType.In ||
                value === SqliteConditionType.NotIn
              ) {
                setValue(`${name}.value`, [])
              } else {
                setValue(`${name}.value`, "")
              }
            },
          }}
        />
      </div>

      {needsValue && !needsArrayValue && !needsRangeValue && (
        <>
          {isBooleanColumn && !condition?.includes("Like") ? (
            <FormSelect
              control={control}
              name={`${name}.value`}
              label="Value"
              placeholder="Select value"
              options={getBooleanOptions()}
            />
          ) : (
            <FormInput
              control={control}
              name={`${name}.value`}
              label="Value"
              placeholder="Enter value"
              type={inputType}
            />
          )}
        </>
      )}

      {needsArrayValue && (
        <ArrayValueForm
          control={control}
          name={`${name}.value`}
          inputType={inputType}
          isBooleanColumn={isBooleanColumn}
        />
      )}

      {needsRangeValue && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isBooleanColumn ? (
            <>
              <FormSelect
                control={control}
                name={`${name}.value.from`}
                label="From"
                placeholder="Select from value"
                options={getBooleanOptions()}
              />
              <FormSelect
                control={control}
                name={`${name}.value.to`}
                label="To"
                placeholder="Select to value"
                options={getBooleanOptions()}
              />
            </>
          ) : (
            <>
              <FormInput
                control={control}
                name={`${name}.value.from`}
                label="From"
                placeholder="Start value"
                type={inputType}
              />
              <FormInput
                control={control}
                name={`${name}.value.to`}
                label="To"
                placeholder="End value"
                type={inputType}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

type ArrayValueFormProps = {
  control: Control<CreateScraper | ExecutionIterator>
  name: `dataSources.${number}.whereSchema.value` | "where.value"
  inputType: string
  isBooleanColumn: boolean
}

function ArrayValueForm({
  control,
  name,
  inputType,
  isBooleanColumn,
}: ArrayValueFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  })

  const addValue = () => {
    append("")
  }

  const getBooleanOptions = () => [
    { value: "true", label: "True" },
    { value: "false", label: "False" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Values</label>
        <Button type="button" variant="outline" size="sm" onClick={addValue}>
          <Plus className="size-4" />
          Add Value
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No values added yet. Click "Add Value" to start.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            {isBooleanColumn ? (
              <FormSelect
                control={control}
                name={`${name}.${index}`}
                label=""
                placeholder="Select value"
                options={getBooleanOptions()}
                className="flex-1"
              />
            ) : (
              <FormInput
                control={control}
                name={`${name}.${index}`}
                label=""
                placeholder={`Value ${index + 1}`}
                type={inputType}
                className="flex-1"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive flex-shrink-0"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

type AddRootButtonProps = {
  addRoot: (type?: "and" | "or") => void
}

function AddRootButton({ addRoot }: AddRootButtonProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-1 items-stretch *:not-first:rounded-l-none *:not-last:rounded-r-none *:not-first:border-l-0 *:not-last:border-r-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addRoot()}
      >
        <Plus className="size-4" />
        Condition
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addRoot("and")}
      >
        <Plus className="size-4" />
        AND Group
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addRoot("or")}
      >
        <Plus className="size-4" />
        OR Group
      </Button>
    </div>
  )
}
