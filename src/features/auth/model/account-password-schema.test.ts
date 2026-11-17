import { describe, expect, it } from 'vitest'
import { accountPasswordSchema } from './account-password-schema'

const valid = { currentPassword: 'current password', newPassword: 'a new password with spaces', confirmPassword: 'a new password with spaces' }

describe('account password confirmation', () => {
  it('requires the confirmation to match and associates the error with that field', () => {
    const result = accountPasswordSchema.safeParse({ ...valid, confirmPassword: 'another new password' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp.' }))
  })

  it('keeps the API minimum of 15 characters rather than the illustrative Figma copy', () => {
    expect(accountPasswordSchema.safeParse({ ...valid, newPassword: '12345678', confirmPassword: '12345678' }).success).toBe(false)
    expect(accountPasswordSchema.safeParse(valid).success).toBe(true)
  })
})
