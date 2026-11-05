import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/api/http'
import {
  getUserRoles,
  grantRole,
  listRoles,
  revokeRole,
} from './user-roles-api'

describe('Admin User Roles API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls GET /admin/roles and returns list of roles', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce([
      { id: 1, roleKey: 'CUSTOMER', roleName: 'Khách hàng' },
      { id: 2, roleKey: 'ADMIN', roleName: 'Quản trị hệ thống' },
      { id: 3, roleKey: 'HOTEL_OWNER', roleName: 'Chủ khách sạn' },
    ])

    const roles = await listRoles()
    expect(spy).toHaveBeenCalledWith(
      '/admin/roles',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(roles).toHaveLength(3)
    expect(roles[1].roleKey).toBe('ADMIN')
  })

  it('calls GET /admin/users/{userId}/roles and returns assigned roles', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      userId: '99999999-9999-4999-8999-999999999901',
      roles: ['ADMIN'],
    })

    const res = await getUserRoles('99999999-9999-4999-8999-999999999901')
    expect(spy).toHaveBeenCalledWith(
      '/admin/users/99999999-9999-4999-8999-999999999901/roles',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(res.userId).toBe('99999999-9999-4999-8999-999999999901')
    expect(res.roles).toEqual(['ADMIN'])
  })

  it('calls PUT /admin/users/{userId}/roles/{roleId} to grant role', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      userId: '99999999-9999-4999-8999-999999999901',
      roles: ['ADMIN', 'HOTEL_OWNER'],
    })

    const res = await grantRole('99999999-9999-4999-8999-999999999901', 3)
    expect(spy).toHaveBeenCalledWith(
      '/admin/users/99999999-9999-4999-8999-999999999901/roles/3',
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(res.roles).toContain('HOTEL_OWNER')
  })

  it('calls DELETE /admin/users/{userId}/roles/{roleId} to revoke role', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValueOnce({
      userId: '99999999-9999-4999-8999-999999999901',
      roles: ['ADMIN'],
    })

    const res = await revokeRole('99999999-9999-4999-8999-999999999901', 3)
    expect(spy).toHaveBeenCalledWith(
      '/admin/users/99999999-9999-4999-8999-999999999901/roles/3',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(res.roles).not.toContain('HOTEL_OWNER')
  })
})
