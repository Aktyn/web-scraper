/** @jsxImportSource @emotion/react */
import { useState } from 'react'
import { css } from '@emotion/react'
import { DataObjectRounded } from '@mui/icons-material'
import { alpha, Box, Button, FormControl, FormHelperText, Stack, useTheme } from '@mui/material'
import { getDeepProperty, tryParseJSON } from '@web-scraper/common'
import * as prism from 'prismjs'
import {
  Controller,
  type PathValue,
  type FieldPath,
  type GlobalError,
  type UseFormReturn,
} from 'react-hook-form'
import Editor from 'react-simple-code-editor'
import { JsonValue } from '../common/JsonValue'
import { NestedDrawer } from '../common/NestedDrawer'
import { ToggleIconButton } from '../common/button/ToggleIconButton'
import 'prismjs/components/prism-json.js'
import 'prismjs/themes/prism-dark.css'

type StringFormProperties<FormSchema extends object> = {
  [key in FieldPath<FormSchema>]: PathValue<FormSchema, key> extends string | null ? key : never
}[FieldPath<FormSchema>]

interface FormJsonInputProps<
  FormSchema extends object,
  StringPropertyName extends StringFormProperties<FormSchema>,
> {
  name: StringPropertyName
  form: UseFormReturn<FormSchema>
  label: string
  required?: boolean
}

export const FormJsonInput = <
  FormSchema extends object,
  StringPropertyName extends StringFormProperties<FormSchema>,
>({
  name,
  form,
  label,
  required,
}: FormJsonInputProps<FormSchema, StringPropertyName>) => {
  const theme = useTheme()
  const error = getDeepProperty(form.formState.errors, name as never) as GlobalError | undefined

  const [openEditor, setOpenEditor] = useState(false)

  const editorCss = css`
    overflow: visible !important;
    max-width: 32rem;
    min-height: 100%;
    font-family: monospace;
    font-size: 0.875rem;

    & > textarea::placeholder {
      color: ${alpha(theme.palette.text.secondary, 0.5)};
    }
    &,
    & > textarea,
    & > pre {
      outline: none;
    }
  `

  return (
    <FormControl
      sx={{
        maxHeight: '8rem',
        overflowY: 'auto',
      }}
    >
      <FormHelperText
        variant="standard"
        margin="dense"
        sx={{ color: error ? (theme) => theme.palette.error.main : undefined }}
      >
        {label}
        {required ? '*' : ''}
      </FormHelperText>
      <Controller
        name={name}
        control={form.control}
        rules={{ required }}
        render={({ field }) => (
          <>
            <NestedDrawer
              title={
                <Stack direction="row" alignItems="center" gap={2}>
                  <Box>{label}</Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    endIcon={<DataObjectRounded />}
                    disabled={!!error}
                    onClick={() => {
                      const parsed =
                        typeof field.value === 'string' ? tryParseJSON(field.value) : null
                      if (parsed) {
                        field.onChange(
                          JSON.stringify(parsed, null, 2) as PathValue<
                            FormSchema,
                            StringPropertyName
                          >,
                        )
                      }
                    }}
                  >
                    Format
                  </Button>
                </Stack>
              }
              onClose={() => setOpenEditor(false)}
              open={openEditor}
            >
              <Stack flexGrow={1} maxHeight="100%" overflow="auto">
                <Editor
                  name={field.name}
                  css={editorCss}
                  textareaId={`json-editor-${name}`}
                  value={field.value ?? ''}
                  placeholder="JSON"
                  onValueChange={field.onChange as (value: string) => void}
                  onBlur={field.onBlur}
                  required={required}
                  highlight={(code) => prism.highlight(code || '', prism.languages.json, 'json')}
                  padding={8}
                />
              </Stack>
            </NestedDrawer>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
                <DataObjectRounded />
                <JsonValue disablePreview>{field.value}</JsonValue>
              </Stack>
              <ToggleIconButton
                open={openEditor}
                onToggle={setOpenEditor}
                closeTooltip="Edit JSON"
                openTooltip="Close editor"
              />
            </Stack>
          </>
        )}
      />
      {error && (
        <FormHelperText
          variant="standard"
          margin="dense"
          sx={{ color: (theme) => theme.palette.error.main }}
        >
          {error.message}
        </FormHelperText>
      )}
    </FormControl>
  )
}
