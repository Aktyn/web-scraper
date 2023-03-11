import { beforeEach, describe, expect, it } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { mockData, databaseMock } from '../test-utils/databaseMock'

import Database from './index'

describe('Database.account', () => {
  beforeEach(() => {
    mockReset(databaseMock)
    databaseMock.site.findMany.mockResolvedValue(mockData.sites)
  })

  it('should return array of existing accounts', async () => {
    await expect(Database.site.getSites({ count: 20 })).resolves.toEqual(mockData.sites)
  })
})
