import { useCallback, useContext, useState } from 'react'
import { CloseRounded, CodeRounded } from '@mui/icons-material'
import { Grow, IconButton, InputAdornment, Tooltip } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFormContext } from 'react-hook-form'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { FormInput, type FormInputProps } from '../form/FormInput'
import { CursorDefaultClickIcon } from '../icons/CursorDefaultClickIcon'

export const ElementFormInput = <FormSchema extends object = UpsertSiteInstructionsSchema>(
  formInputProps: Partial<FormInputProps<FormSchema>> & {
    name: FormInputProps<FormSchema>['name']
  },
) => {
  const cancellable = useCancellablePromise()
  const form = useFormContext<FormSchema>()
  const testingSession = useContext(SiteInstructionsTestingSessionContext)

  const [waitingForElementPick, setWaitingForElementPick] = useState(false)

  const { setValue } = form
  const handlePickElement = useCallback(() => {
    if (!testingSession) {
      return
    }
    setWaitingForElementPick(true)
    cancellable(testingSession.pickElement())
      .then((jsPath) => {
        if (jsPath) {
          setValue(formInputProps.name, jsPath as never, { shouldValidate: true })
        }
        setWaitingForElementPick(false)
      })
      .catch((error) => {
        if (error) {
          console.error(error)
          setWaitingForElementPick(false)
        }
      })
  }, [cancellable, formInputProps.name, setValue, testingSession])

  const handleCancelPickElement = useCallback(() => {
    testingSession?.cancelPickingElement()
  }, [testingSession])

  //TODO: allow for multiple elements in which the first found is used

  return (
    <FormInput
      form={form}
      label="Element"
      placeholder="JS path"
      {...formInputProps}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CodeRounded />
          </InputAdornment>
        ),
        endAdornment: (
          <Grow in={!!testingSession} unmountOnExit>
            <InputAdornment position="end">
              <Tooltip title={waitingForElementPick ? 'Cancel picking' : 'Pick element'}>
                {!waitingForElementPick ? (
                  <IconButton onClick={handlePickElement}>
                    <CursorDefaultClickIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton onClick={handleCancelPickElement}>
                    <CloseRounded fontSize="small" />
                  </IconButton>
                )}
              </Tooltip>
            </InputAdornment>
          </Grow>
        ),
        ...formInputProps.InputProps,
      }}
      sx={{
        minWidth: '16rem',
        ...formInputProps.sx,
      }}
    />
  )
}
