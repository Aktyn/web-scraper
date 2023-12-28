import { ErrorCode } from '@web-scraper/common'
import { mockReset } from 'jest-mock-extended'

import { databaseMock, mockData } from '../test-utils/databaseMock'

import Database from './index'

describe('Database.site', () => {
  beforeEach(() => {
    mockReset(databaseMock)
    databaseMock.site.findMany.mockResolvedValue(mockData.sites)
    databaseMock.site.findUnique.mockResolvedValue(mockData.sites[0])
    databaseMock.site.create.mockResolvedValue(mockData.sites[0])
    databaseMock.site.delete.mockResolvedValue(mockData.sites[0])
    databaseMock.site.update.mockResolvedValue(mockData.sites[0])
  })

  it('should return array of existing sites', async () => {
    await expect(Database.site.getSites({ count: 20 })).resolves.toEqual(mockData.sites)
  })

  it('should return site with given id', async () => {
    await expect(Database.site.getSite(1)).resolves.toEqual(mockData.sites[0])
  })

  it('should create site and return it', async () => {
    databaseMock.site.findUnique.mockResolvedValue(null)
    await expect(
      Database.site.createSite({ url: 'https://example.com', language: 'PL', siteTags: [] }),
    ).resolves.toEqual(mockData.sites[0])
  })

  it('should throw error when given url is incorrect', async () => {
    await expect(
      Database.site
        .createSite({ url: 'https://example', language: 'PL', siteTags: [] })
        .catch((code) => code),
    ).resolves.toBe(ErrorCode.INCORRECT_DATA)
  })

  it('should update site and return it', async () => {
    await expect(
      Database.site.updateSite(1, { url: 'https://example.com', language: 'PL', siteTags: [] }),
    ).resolves.toEqual(mockData.sites[0])
  })

  it('should delete site with given in', async () => {
    await expect(Database.site.deleteSite(1)).resolves.toEqual(mockData.sites[0])
  })
})
