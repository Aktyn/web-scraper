import { useEffect, useMemo } from 'react'
import { FormatListBulletedRounded } from '@mui/icons-material'
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { GlobalActionType, type UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { Controller, useFormContext } from 'react-hook-form'
import { GlobalReturnValuesForm } from './GlobalReturnValuesForm'
import { globalActionTypeNames } from '../../utils/site-instructions-helpers'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'

interface FlowStepFormProps {
  fieldName:
    | `procedures.${number}.flow`
    | `procedures.${number}.flow.onSuccess`
    | `procedures.${number}.flow.onFailure`
  level?: number
  title?: string
}

export const FlowStepForm = ({
  fieldName: deepFieldName,
  title = 'Flow',
  level = 1,
}: FlowStepFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()

  const fieldName = deepFieldName as `procedures.${number}.flow`
  const flow = form.watch(fieldName)
  const items = useMemo(() => (flow ? [flow] : []), [flow])

  return (
    <ItemsList
      title={
        title === 'Flow' ? (
          <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
            <ItemTitle>{title}</ItemTitle>
            <TermInfo term="Flow step" sx={{ pointerEvents: 'all' }} />
          </Stack>
        ) : (
          title
        )
      }
      items={items}
      level={level}
      onAdd={
        flow
          ? undefined
          : () =>
              form.setValue(fieldName, {
                actionName: `global.${GlobalActionType.FINISH}`,
                globalReturnValues: [],
                onSuccess: null,
                onFailure: null,
              })
      }
      onDelete={() => form.setValue(fieldName, null)}
    >
      {(_, index) => [
        index,
        <Stack key={index} flexGrow={1} gap={2}>
          <ActionNameForm fieldName={fieldName} />
          <GlobalReturnValuesForm level={level + 1} fieldName={`${fieldName}.globalReturnValues`} />
          <FlowStepForm fieldName={`${fieldName}.onSuccess`} title="On success" level={level + 1} />
          <FlowStepForm fieldName={`${fieldName}.onFailure`} title="On failure" level={level + 1} />
        </Stack>,
      ]}
    </ItemsList>
  )
}

const ActionNameForm = ({ fieldName }: { fieldName: `procedures.${number}.flow` }) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const actionNameValue = form.watch(`${fieldName}.actionName`)
  const actions = form.watch('actions')
  const actionNamesWatcher = form.watch(
    actions.map((_, index) => `actions.${index}.name`) as `actions.${number}.name`[],
  )

  const actionNames = useMemo(() => [...new Set(actionNamesWatcher)], [actionNamesWatcher])

  useEffect(() => {
    const [prefix, actionName] = actionNameValue?.split('.') ?? ['', '']
    if (prefix === 'action' && actionName && !actionNames.includes(actionName)) {
      form.setValue(`${fieldName}.actionName`, 'action.')
    }
  }, [actionNameValue, actionNames, fieldName, form])

  return (
    <Controller
      name={`${fieldName}.actionName`}
      control={form.control}
      render={({ field, fieldState }) => {
        const [prefix, actionName] = field.value?.split('.') ?? ['', '']

        const handleTypeChange = (type: 'global' | 'action') => {
          if (type === 'global') {
            field.onChange(`${type}.${GlobalActionType.FINISH}`)
          } else {
            field.onChange(`${type}.${actionNames[0] ?? ''}`)
          }
        }

        const handleActionNameChange = (name: GlobalActionType | string) => {
          field.onChange(`${prefix}.${name}`)
        }

        return (
          <FormControl error={!!fieldState.error} sx={{ justifySelf: 'flex-end' }}>
            <InputLabel variant="standard" margin="dense" shrink>
              Action name
            </InputLabel>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <TextField
                variant="standard"
                label=" "
                select
                error={!!fieldState.error}
                value={prefix ?? ''}
                onChange={(e) => handleTypeChange(e.target.value as 'global' | 'action')}
                onBlur={field.onBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListBulletedRounded />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="global">Global</MenuItem>
                <MenuItem value="action">Action</MenuItem>
              </TextField>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="text.secondary"
                sx={{ alignSelf: 'flex-end' }}
              >
                .
              </Typography>
              <TextField
                variant="standard"
                label=" "
                select
                error={!!fieldState.error}
                value={actionName ?? ''}
                onChange={(e) => handleActionNameChange(e.target.value)}
                onBlur={field.onBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListBulletedRounded />
                    </InputAdornment>
                  ),
                }}
              >
                {prefix === 'global'
                  ? Object.values(GlobalActionType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {globalActionTypeNames[type]}
                      </MenuItem>
                    ))
                  : actionNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
              </TextField>
            </Stack>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        )
      }}
    />
  )
}
