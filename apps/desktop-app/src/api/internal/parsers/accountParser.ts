import type { Account as DatabaseAccount } from '@prisma/client'
import type { Account } from '@web-scrapper/common'

import { decrypt } from '../../../utils'

export function parseDatabaseAccount(
  accountData: DatabaseAccount,
  password: string | null,
): Account {
  return {
    ...accountData,
    loginOrEmail: password ? decrypt(accountData.loginOrEmail, password) : '',
    password: password ? decrypt(accountData.password, password) : '',
    additionalCredentialsData:
      accountData.additionalCredentialsData &&
      (password ? decrypt(accountData.additionalCredentialsData, password) : ''),
  }
}
