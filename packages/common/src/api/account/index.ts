export interface Account {
  id: number
  createdAt: Date
  loginOrEmail: string
  password: string
  additionalCredentialsData: string | null
  lastUsed: Date | null
  active: boolean | null
  siteId: number
}
