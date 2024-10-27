import type { ApiError } from '@web-scraper/common'
import { errorLabels, parseError } from '~/lib/error-helpers'

export function ApiErrorToastMessage({ data }: { data: ApiError }) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-sm">{errorLabels[data.errorCode]}</p>
      {data.error && (
        <p className="text-xs max-w-[16rem] max-h-32 overflow-hidden text-ellipsis">
          ({parseError(data.error)})
        </p>
      )}
    </div>
  )
}
