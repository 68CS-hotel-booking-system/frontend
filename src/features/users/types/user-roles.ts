import { z } from 'zod'

/**
 * GET /api/v1/admin/roles
 */
export const roleResponseSchema = z.object({
  id: z.number().int().positive(),
  roleKey: z.string().min(1),
  roleName: z.string().min(1),
})
export type RoleResponse = z.infer<typeof roleResponseSchema>

/**
 * GET /api/v1/admin/users/{userId}/roles
 * PUT /api/v1/admin/users/{userId}/roles/{roleId}
 * DELETE /api/v1/admin/users/{userId}/roles/{roleId}
 */
export const userRolesResponseSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()),
})
export type UserRolesResponse = z.infer<typeof userRolesResponseSchema>
