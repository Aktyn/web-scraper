import { useMemo, useEffect } from 'react'
import { FormatListBulletedRounded } from '@mui/icons-material'
import {
  FormControl,
  InputLabel,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Typography,
  FormHelperText,
} from '@mui/material'
import {
  GlobalActionType,
  REGULAR_ACTION_PREFIX,
  GLOBAL_ACTION_PREFIX,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { useFormContext, Controller } from 'react-hook-form'
import { globalActionTypeNames } from '../../utils/dictionaries'

export const ActionNameInput = ({ fieldName }: { fieldName: `procedures.${number}.flow` }) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const actionNameValue = form.watch(`${fieldName}.actionName`)
  const actions = form.watch('actions')
  const actionNamesWatcher = form.watch(
    actions.map((_, index) => `actions.${index}.name`) as `actions.${number}.name`[],
  )

  const actionNames = useMemo(() => [...new Set(actionNamesWatcher)], [actionNamesWatcher])

  useEffect(() => {
    const [prefix, actionName] = actionNameValue?.split('.') ?? ['', '']
    if (prefix === REGULAR_ACTION_PREFIX && actionName && !actionNames.includes(actionName)) {
      form.setValue(`${fieldName}.actionName`, `${REGULAR_ACTION_PREFIX}.`)
    }
  }, [actionNameValue, actionNames, fieldName, form])

  return (
    <Controller
      name={`${fieldName}.actionName`}
      control={form.control}
      render={({ field, fieldState }) => {
        const [prefix, actionName] = field.value?.split('.') ?? ['', '']

        const handleTypeChange = (
          type: typeof GLOBAL_ACTION_PREFIX | typeof REGULAR_ACTION_PREFIX,
        ) => {
          if (type === GLOBAL_ACTION_PREFIX) {
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
            <Stack direction="row" alignItems="stretch" gap="0.5rem">
              <TextField
                variant="standard"
                label=" "
                select
                error={!!fieldState.error}
                value={prefix ?? ''}
                onChange={(e) =>
                  handleTypeChange(
                    e.target.value as typeof GLOBAL_ACTION_PREFIX | typeof REGULAR_ACTION_PREFIX,
                  )
                }
                onBlur={field.onBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListBulletedRounded />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value={GLOBAL_ACTION_PREFIX}>Global</MenuItem>
                <MenuItem value={REGULAR_ACTION_PREFIX}>Action</MenuItem>
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
                sx={{ flexGrow: 1 }}
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
