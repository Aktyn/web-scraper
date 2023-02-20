export interface Account {
  id: number
  loginOrEmail: string
  password: string
  additionalCredentialsData: string | null
  lastUsed: Date | null
  active: boolean | null
  siteId: number
}
