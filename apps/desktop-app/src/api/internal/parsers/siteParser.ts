import type {
  SiteTag as DatabaseSiteTag,
  SiteTagsRelation as DatabaseSiteTagsRelation,
} from '@prisma/client'
import { pick, type Site, type SiteTag } from '@web-scraper/common'

import type { getSites } from '../../../database/site'

export function parseDatabaseSite(siteData: Awaited<ReturnType<typeof getSites>>[number]): Site {
  return {
    ...pick(siteData, 'id', 'createdAt', 'url', 'language'),
    tags: siteData.Tags.map(parseDatabaseSiteTagRelation),
  }
}

function parseDatabaseSiteTagRelation(
  siteTagRelation: DatabaseSiteTagsRelation & { Tag: DatabaseSiteTag },
): SiteTag {
  return siteTagRelation.Tag
}

export function parseDatabaseSiteTag(siteTag: DatabaseSiteTag): SiteTag {
  return siteTag
}
