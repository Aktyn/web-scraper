import { useCallback, useContext } from 'react'
import type {
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from '@web-scrapper/common'
import { UserDataContext } from '../../context/userDataContext'

export function useEncryptedApiRequest<DataType, IdProperty extends keyof DataType>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiRequest: PaginatedApiFunctionWithEncryptedData<DataType, IdProperty>,
) {
  const { dataEncryptionPassword } = useContext(UserDataContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useCallback<PaginatedApiFunction<DataType, IdProperty>>(
    (requestData) => apiRequest(requestData, dataEncryptionPassword),
    [apiRequest, dataEncryptionPassword],
  )
}
