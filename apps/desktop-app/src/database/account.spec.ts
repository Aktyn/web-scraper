import { beforeEach, describe, expect, it } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { mockData, databaseMock } from '../test-utils/databaseMock'

import Database from './index'

describe('Database.account', () => {
  beforeEach(() => {
    mockReset(databaseMock)
    databaseMock.account.findMany.mockResolvedValue(mockData.accounts)
  })

  it('should return array of existing accounts', async () => {
    await expect(Database.account.getAccounts({ count: 20, filters: [] })).resolves.toEqual(
      mockData.accounts,
    )
  })
})
