import { z } from 'zod'
import { http } from '@/shared/api/http'
import {
  type RoleResponse,
  roleResponseSchema,
  type UserRolesResponse,
  userRolesResponseSchema,
} from '../types/user-roles'

/**
 * GET /api/v1/admin/roles — Lấy danh sách toàn bộ vai trò hệ thống
 */
export function listRoles(signal?: AbortSignal): Promise<RoleResponse[]> {
  return http.request('/admin/roles', {
    method: 'GET',
    signal,
    schema: z.array(roleResponseSchema),
  })
}

/**
 * GET /api/v1/admin/users/{userId}/roles — Lấy danh sách vai trò hiện có của người dùng
 */
export function getUserRoles(
  userId: string,
  signal?: AbortSignal,
): Promise<UserRolesResponse> {
  return http.request(`/admin/users/${encodeURIComponent(userId)}/roles`, {
    method: 'GET',
    signal,
    schema: userRolesResponseSchema,
  })
}

/**
 * PUT /api/v1/admin/users/{userId}/roles/{roleId} — Cấp thêm vai trò cho người dùng
 */
export function grantRole(
  userId: string,
  roleId: number,
  signal?: AbortSignal,
): Promise<UserRolesResponse> {
  return http.request(
    `/admin/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    {
      method: 'PUT',
      signal,
      schema: userRolesResponseSchema,
    },
  )
}

/**
 * DELETE /api/v1/admin/users/{userId}/roles/{roleId} — Thu hồi vai trò của người dùng
 */
export function revokeRole(
  userId: string,
  roleId: number,
  signal?: AbortSignal,
): Promise<UserRolesResponse> {
  return http.request(
    `/admin/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    {
      method: 'DELETE',
      signal,
      schema: userRolesResponseSchema,
    },
  )
}
