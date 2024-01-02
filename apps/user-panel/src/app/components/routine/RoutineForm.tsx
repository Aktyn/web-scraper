import { useCallback, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { ChecklistRounded, LabelRounded, SendRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { FormHelperText, InputAdornment, Skeleton, Stack, Typography } from '@mui/material'
import {
  upsertRoutineSchema,
  type Procedure,
  type Site,
  type SiteProcedures,
  type UpsertRoutineSchema,
  RoutineExecutionType,
} from '@web-scraper/common'
import { FormProvider, useForm } from 'react-hook-form'
import { usePersistentState } from 'src/app/hooks/usePersistentState'
import { ProcedureSelectList } from './ProcedureSelectList'
import { ProceduresSequence } from './ProceduresSequence'
import { RoutineExecutionPlanForm } from './RoutineExecutionPlanForm'
import { useApiRequest } from '../../../app/hooks/useApiRequest'
import { LabeledDivider } from '../common/LabeledDivider'
import { NestedDrawer } from '../common/NestedDrawer'
import { ToggleIconButton } from '../common/button/ToggleIconButton'
import { FormInput } from '../form/FormInput'
import { FormSwitch } from '../form/FormSwitch'

interface RoutineFormProps {
  onSuccess: () => void
}

export const RoutineForm = ({ onSuccess }: RoutineFormProps) => {
  // const procedureSelectPopoverRef = useRef<CustomPopoverRef>(null)

  const { submit: createRoutineRequest, submitting: creatingRoutine } = useApiRequest(
    window.electronAPI.createRoutine,
  )
  // const {submit: updateSiteRequest} = useApiRequest(window.electronAPI.updateSite)
  const { submit: getGroupedProceduresRequest } = useApiRequest(
    window.electronAPI.getProceduresGroupedBySite,
  )

  const [openProceduresSelect, setOpenProceduresSelect] = useState(false)
  const [loadingProcedures, setLoadingProcedures] = useState(true)
  const [siteProcedures, setSiteProcedures] = usePersistentState<SiteProcedures[]>(
    'procedures-grouped-by-site',
    [],
  )

  const loadProcedures = useCallback(() => {
    setLoadingProcedures(true)
    getGroupedProceduresRequest({
      onSuccess: setSiteProcedures,
      onEnd: () => setLoadingProcedures(false),
    })
  }, [getGroupedProceduresRequest, setSiteProcedures])

  const form = useForm({
    mode: 'onTouched',
    resolver: yupResolver(upsertRoutineSchema),
    defaultValues: {
      procedureIds: [],
      executionPlan: {
        type: RoutineExecutionType.STANDALONE,
        repeat: 1,
      },
    },
    // defaultValues: site
    //   ? {
    //       url: site.url,
    //       language: site.language,
    //       siteTags: site.tags,
    //     }
    //   : undefined,
  })
  // const siteTagsFields = useFieldArray({
  //   control: form.control,
  //   name: 'siteTags',
  //   keyName: 'fieldKey',
  // })

  const { setValue } = form
  const procedureIds = form.watch('procedureIds')
  const proceduresError = form.formState.errors.procedureIds?.message

  const selectedProceduresList = useMemo(() => {
    const proceduresWithSites = siteProcedures.flatMap((site) =>
      site.procedures.map((procedure) => ({ site: site.site, procedure })),
    )
    return (procedureIds ?? []).reduce(
      (acc, id) => {
        const proceduresWithSite = proceduresWithSites.find(({ procedure }) => procedure.id === id)
        if (proceduresWithSite) {
          acc.push(proceduresWithSite)
        }
        return acc
      },
      [] as { site: Site; procedure: Procedure }[],
    )
  }, [procedureIds, siteProcedures])

  const onSubmit = useCallback(
    (data: UpsertRoutineSchema) => {
      createRoutineRequest(
        {
          onSuccess: (_, { enqueueSnackbar }) => {
            enqueueSnackbar({ variant: 'success', message: 'Routine created' })
            onSuccess()
          },
        },
        data,
      )
    },
    [createRoutineRequest, onSuccess],
  )

  const handleProcedureChecked = useCallback(
    (procedure: Procedure, checked: boolean) => {
      setValue(
        'procedureIds',
        checked
          ? [...new Set([...(procedureIds ?? []), procedure.id])]
          : (procedureIds ?? []).filter((id) => id !== procedure.id),
        { shouldValidate: true, shouldDirty: true },
      )
    },
    [procedureIds, setValue],
  )

  const handleSwapSelectedProcedures = useCallback(
    (index1: number, index2: number) => {
      if (index1 === index2) {
        return
      }
      const newProcedureIds = [...(procedureIds ?? [])]
      const temp = newProcedureIds[index1]
      newProcedureIds[index1] = newProcedureIds[index2]
      newProcedureIds[index2] = temp
      setValue('procedureIds', newProcedureIds)
    },
    [procedureIds, setValue],
  )

  return (
    <FormProvider {...form}>
      <Stack
        flexGrow={1}
        justifyContent="space-between"
        p="1rem"
        gap="1rem"
        overflow="auto"
        component="form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Stack gap="2rem">
          <FieldsGroup title="Basic config">
            <FormInput
              name="name"
              form={form}
              label="Name"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LabelRounded />
                  </InputAdornment>
                ),
              }}
            />
            <FormInput
              name="description"
              form={form}
              label="Description"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LabelRounded />
                  </InputAdornment>
                ),
              }}
            />
            <FormSwitch<UpsertRoutineSchema> fieldName="stopOnError" label="Stop on error" />
          </FieldsGroup>
          <FieldsGroup
            title={
              <Stack direction="row" alignItems="center" columnGap="0.5rem">
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  textAlign="center"
                  color="text.secondary"
                >
                  Procedures sequence
                </Typography>
                <ToggleIconButton
                  open={openProceduresSelect}
                  onToggle={(open) => {
                    if (open) {
                      loadProcedures()
                    }
                    setOpenProceduresSelect(open)
                  }}
                  closedStateIcon={ChecklistRounded}
                  closeTooltip="Select procedures from list"
                  openTooltip="Close selection panel"
                />
              </Stack>
            }
          >
            <ProceduresSequence
              selectedProceduresList={selectedProceduresList}
              onSwap={handleSwapSelectedProcedures}
              onRemove={(procedure) => handleProcedureChecked(procedure, false)}
            />
            {proceduresError && (
              <FormHelperText
                variant="standard"
                margin="dense"
                sx={{ color: (theme) => theme.palette.error.main, textAlign: 'center' }}
              >
                {proceduresError}
              </FormHelperText>
            )}
          </FieldsGroup>
          <FieldsGroup title="Execution plan">
            <RoutineExecutionPlanForm />
          </FieldsGroup>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <LoadingButton
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<SendRounded />}
            loading={creatingRoutine}
            loadingPosition="end"
          >
            Submit
          </LoadingButton>
        </Stack>
      </Stack>
      <NestedDrawer
        title="Select procedures"
        onClose={() => setOpenProceduresSelect(false)}
        open={openProceduresSelect}
      >
        {loadingProcedures && !siteProcedures.length ? (
          <Stack minWidth="8rem" alignItems="stretch" gap="0.5rem" p="1rem">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width="100%"
                height="1rem"
                animation="pulse"
              />
            ))}
          </Stack>
        ) : (
          <Stack overflow="auto">
            <ProcedureSelectList
              siteProcedures={siteProcedures}
              selectedProcedures={procedureIds}
              onToggle={handleProcedureChecked}
            />
          </Stack>
        )}
      </NestedDrawer>
    </FormProvider>
  )
}

const FieldsGroup = ({ title, children }: PropsWithChildren<{ title?: ReactNode }>) => {
  return (
    <Stack gap="1rem">
      {title && (
        <LabeledDivider
          label={
            typeof title === 'string' ? (
              <Typography
                variant="body1"
                fontWeight="bold"
                textAlign="center"
                color="text.secondary"
              >
                {title}
              </Typography>
            ) : (
              title
            )
          }
        />
      )}
      {children}
    </Stack>
  )
}
