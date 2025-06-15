import { toast } from "sonner"

export type CommonResponseOptions = {
  /** Pass null or empty string to disable toast */
  successMessage?: string | null

  /** Pass null or empty string to disable toast */
  errorMessage?: string | null
}

export function handleSuccessResponse(
  defaultMessage: string,
  options?: CommonResponseOptions,
) {
  if (options?.successMessage !== "" && options?.successMessage !== null) {
    toast.success(options?.successMessage ?? defaultMessage)
  }
}

export function handleErrorResponse(
  error: unknown,
  defaultMessage: string,
  options?: CommonResponseOptions,
) {
  console.error(error)

  if (options?.errorMessage !== "" && options?.errorMessage !== null) {
    toast.error(options?.errorMessage ?? defaultMessage, {
      description: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
