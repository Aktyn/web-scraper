import { ErrorCode } from '@web-scrapper/common'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockReset } from 'vitest-mock-extended'

import { databaseMock, mockData } from '../test-utils/databaseMock'

import Database from './index'

describe('Database.site', () => {
  beforeEach(() => {
    mockReset(databaseMock)
    databaseMock.site.findMany.mockResolvedValue(mockData.sites)
    databaseMock.site.create.mockResolvedValue(mockData.sites[0])
    databaseMock.site.delete.mockResolvedValue(mockData.sites[0])
  })

  it('should return array of existing sites', async () => {
    await expect(Database.site.getSites({ count: 20 })).resolves.toEqual(mockData.sites)
  })

  it('should create site and return it', async () => {
    await expect(
      Database.site.createSite({ url: 'https://example.com', language: 'PL' }),
    ).resolves.toEqual(mockData.sites[0])
  })

  it('should throw error when given url is incorrect', async () => {
    await expect(
      Database.site.createSite({ url: 'https://example', language: 'PL' }).catch((code) => code),
    ).resolves.toBe(ErrorCode.INCORRECT_DATA)
  })

  it('should delete site with given in', async () => {
    await expect(Database.site.deleteSite(1)).resolves.toEqual(mockData.sites[0])
  })
})
