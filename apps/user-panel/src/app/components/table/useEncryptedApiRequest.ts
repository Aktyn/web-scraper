import { useCallback, useContext } from 'react'
import type {
  PaginatedApiFunction,
  PaginatedApiFunctionWithEncryptedData,
} from '@web-scrapper/common'
import { UserDataContext } from '../../context/userDataContext'

export function useEncryptedApiRequest<DataType>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiRequest: PaginatedApiFunctionWithEncryptedData<DataType, any>,
) {
  const { dataEncryptionPassword } = useContext(UserDataContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useCallback<PaginatedApiFunction<DataType, any>>(
    (requestData) => apiRequest(requestData, dataEncryptionPassword),
    [apiRequest, dataEncryptionPassword],
  )
}
