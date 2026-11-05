import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserRoles,
  grantRole,
  listRoles,
  revokeRole,
} from '../api/user-roles-api'

export const userRoleKeys = {
  all: ['user-roles'] as const,
  list: () => ['user-roles', 'roles-list'] as const,
  userRoles: (userId: string) => ['user-roles', 'user', userId] as const,
}

/**
 * GET /api/v1/admin/roles — Lấy danh sách toàn bộ vai trò hệ thống
 */
export function useRolesQuery() {
  return useQuery({
    queryKey: userRoleKeys.list(),
    queryFn: ({ signal }) => listRoles(signal),
    retry: false,
  })
}

/**
 * GET /api/v1/admin/users/{userId}/roles — Lấy danh sách vai trò của một tài khoản
 */
export function useUserRolesQuery(userId: string) {
  return useQuery({
    queryKey: userRoleKeys.userRoles(userId),
    queryFn: ({ signal }) => getUserRoles(userId, signal),
    enabled: Boolean(userId),
    retry: false,
  })
}

/**
 * PUT /api/v1/admin/users/{userId}/roles/{roleId} — Cấp quyền cho tài khoản
 */
export function useGrantRoleMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: number) => grantRole(userId, roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.userRoles(userId),
      })
    },
  })
}

/**
 * DELETE /api/v1/admin/users/{userId}/roles/{roleId} — Thu hồi quyền của tài khoản
 */
export function useRevokeRoleMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: number) => revokeRole(userId, roleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: userRoleKeys.userRoles(userId),
      })
    },
  })
}
