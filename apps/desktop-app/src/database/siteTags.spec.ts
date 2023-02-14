import { beforeEach, describe, expect, it } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { mockData, databaseMock } from '../test-utils/databaseMock'

import Database from './index'

describe('Database.siteTags', () => {
  beforeEach(() => {
    mockReset(databaseMock)
    databaseMock.siteTag.findMany.mockResolvedValue(mockData.siteTags)
  })

  it('should return array of site tags', async () => {
    await expect(Database.siteTags.getSiteTags()).resolves.toEqual(mockData.siteTags)
  })
})
