import * as crypto from 'crypto'

export function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('base64')
}

export function encrypt(data: Buffer | string, password: string): string
export function encrypt(data: Buffer | string, password: string, output: 'base64'): string
export function encrypt(data: Buffer | string, password: string, output: 'buffer'): Buffer
export function encrypt(
  data: Buffer | string,
  password: string,
  output: 'base64' | 'buffer' = 'base64',
): Buffer | string {
  const key = passwordToCipherKey(password)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)
  const decryptedBuffer: Buffer = Buffer.concat([iv, cipher.update(data), cipher.final()])
  return output === 'buffer' ? decryptedBuffer : decryptedBuffer.toString('base64')
}

export function decrypt(encrypted: Buffer | string, password: string) {
  const encryptedBuffer = Buffer.isBuffer(encrypted) ? encrypted : Buffer.from(encrypted, 'base64')

  const key = passwordToCipherKey(password)
  const iv = encryptedBuffer.slice(0, 16)
  const encryptedData = encryptedBuffer.slice(16)

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString('utf8')
}

function passwordToCipherKey(password: string) {
  return crypto.createHash('sha256').update(password).digest('base64').substr(0, 32)
}
