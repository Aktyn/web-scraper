import { describe, expect, it } from 'vitest'

import { decrypt, encrypt, sha256 } from './crypto'

describe('sha256', () => {
  it('should generate sha256 string based on given input', () => {
    // noinspection SpellCheckingInspection
    expect(sha256('mock input')).toBe('kYj+IeHC42Mv/SiKsMhO7Nt9U+Cf6vgixZHNbR1LTrA=')
    // noinspection SpellCheckingInspection
    expect(sha256('mock input 2')).toBe('nNMLmgEDJRm0ph8Rx/tGhCWzx6WeLonE1hWKlzAZlfg=')
  })
})

describe('encrypt and decrypt', () => {
  it('should encrypt and decrypt data with given password', () => {
    const password = 'mock password'
    const data = 'mock data'
    const encrypted = encrypt(data, password)

    expect(encrypted).not.toBe(data)

    const decrypted = decrypt(encrypted, password)

    expect(decrypted).not.toBe(encrypted)
    expect(decrypted).toBe(data)
  })
})
