export interface Site {
  id: number
  createdAt: Date
  url: string
  language: string | null
  tags: SiteTag[]
}

export interface SiteTag {
  id: number
  name: string
  description: string | null
}
