import { z } from 'zod'
import { http } from '@/shared/api/http'
import { getSession, setSession } from '@/shared/api/session'
import { queryClient } from '@/shared/lib/query-client'

const required = z.string().trim().min(1, 'Vui lòng nhập giá trị.')
const uuid = z.string().uuid('Nhập UUID hợp lệ.')
const email = z.string().trim().email('Email không hợp lệ.').max(255)
const password = z.string().min(15, 'Mật khẩu cần 15–128 ký tự.').max(128)
const integer = (min: number, max: number) =>
  required.refine(
    (v) => /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max,
    'Nhập số nguyên từ ' + min + ' đến ' + max + '.',
  )
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Nhập giờ HH:mm.')
const instant = required.refine(
  (v) => /Z$|[+-]\d{2}:\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
  'Nhập ISO 8601 có múi giờ, ví dụ 2026-11-05T14:00:00+07:00.',
)
const user = z.object({
  id: uuid,
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  status: z.string(),
  emailVerified: z.boolean(),
  version: z.number(),
})
const login = z.object({
  accessToken: required,
  refreshToken: required,
  tokenType: z.literal('Bearer'),
  expiresAt: z.string(),
  user: user.nullable(),
})
const hotel = z.object({
  id: uuid,
  ownerId: uuid,
  cityId: uuid,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  address: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  starRating: z.number().nullable(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
})
const userRoles = z.object({ userId: uuid, roles: z.array(z.string()) })
const page = z.object({
  content: z.array(hotel),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  first: z.boolean(),
  last: z.boolean(),
})
export interface Field {
  key: string
  label: string
  rule: z.ZodType<string, string>
  secret?: boolean
  initial?: string
}
export interface Operation {
  id: string
  title: string
  group: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: (v: Record<string, string>) => string
  fields: Field[]
  response: z.ZodType
  authenticated?: boolean
  body?: (v: Record<string, string>) => unknown
  success?: string
}
const f = (
  key: string,
  label: string,
  rule: z.ZodType<string, string> = required,
  initial?: string,
): Field => ({ key, label, rule, initial, secret: /password|token/i.test(key) })
const account = 'Tài khoản'
const hotels = 'Khách sạn & phòng'
const roles = 'Vai trò (ADMIN)'
const auth = (
  id: string,
  title: string,
  fields: Field[],
  response: z.ZodType,
  success?: string,
): Operation => ({
  id,
  title,
  fields,
  response,
  success,
  group: account,
  method: 'POST',
  path: () => '/auth/' + id,
  body: (v) => v,
})
const hotelId = f('hotelId', 'ID khách sạn', uuid)
const userId = f('userId', 'ID tài khoản', uuid)
const roleId = f('roleId', 'ID vai trò (số)', integer(1, 2147483647))
const hotelPath = (v: Record<string, string>) =>
  '/management/hotels/' + encodeURIComponent(v.hotelId)
const rolePath = (v: Record<string, string>) =>
  '/admin/users/' + encodeURIComponent(v.userId) + '/roles'
export const operations: Operation[] = [
  auth(
    'login',
    'Đăng nhập',
    [
      f('email', 'Email', email),
      f('password', 'Mật khẩu', z.string().min(1).max(128)),
    ],
    login,
  ),
  auth(
    'register',
    'Đăng ký',
    [
      f('email', 'Email', email),
      f('password', 'Mật khẩu (15–128 ký tự)', password),
      f('fullName', 'Họ tên', required.max(100)),
      f('phone', 'Số điện thoại', required.max(20)),
    ],
    user,
    'Đăng ký thành công. Kiểm tra hộp thư để xác minh email.',
  ),
  auth(
    'email-verifications',
    'Xác minh email',
    [f('token', 'Mã xác minh', required)],
    z.object({ accepted: z.boolean() }),
  ),
  auth(
    'forgot-password',
    'Quên mật khẩu',
    [f('email', 'Email', email)],
    z.object({ accepted: z.boolean() }),
    'Nếu tài khoản đủ điều kiện, hệ thống sẽ gửi email đặt lại mật khẩu.',
  ),
  auth(
    'reset-password',
    'Đặt lại mật khẩu',
    [
      f('token', 'Mã đặt lại mật khẩu', required.max(128)),
      f('newPassword', 'Mật khẩu mới', password),
    ],
    z.object({ reset: z.boolean() }),
  ),
  {
    ...auth('refresh', 'Làm mới phiên', [], login),
    authenticated: true,
    body: () => ({ refreshToken: getSession()?.refreshToken }),
  },
  {
    ...auth('logout', 'Đăng xuất', [], z.null()),
    authenticated: true,
    body: () => ({ refreshToken: getSession()?.refreshToken }),
  },
  {
    id: 'me',
    title: 'Thông tin tài khoản',
    group: account,
    method: 'GET',
    path: () => '/users/me',
    fields: [],
    response: user.extend({ roles: z.array(z.string()) }),
    authenticated: true,
  },
  {
    id: 'password',
    title: 'Đổi mật khẩu',
    group: account,
    method: 'POST',
    path: () => '/users/me/password',
    fields: [
      f('currentPassword', 'Mật khẩu hiện tại', z.string().min(1).max(128)),
      f('newPassword', 'Mật khẩu mới', password),
    ],
    body: (v) => v,
    response: z.object({ changed: z.boolean() }),
    authenticated: true,
    success: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.',
  },
  {
    id: 'hotels',
    title: 'Danh sách khách sạn',
    group: hotels,
    method: 'GET',
    path: (v) => '/management/hotels?page=' + v.page + '&size=' + v.size,
    fields: [
      f('page', 'Trang (bắt đầu từ 0)', integer(0, 2147483647), '0'),
      f('size', 'Số bản ghi', integer(1, 100), '20'),
    ],
    response: page,
    authenticated: true,
  },
  {
    id: 'hotel',
    title: 'Chi tiết khách sạn',
    group: hotels,
    method: 'GET',
    path: hotelPath,
    fields: [hotelId],
    response: hotel,
    authenticated: true,
  },
  {
    id: 'create-hotel',
    title: 'Tạo khách sạn (ADMIN)',
    group: hotels,
    method: 'POST',
    path: () => '/admin/hotels',
    fields: [
      f('ownerId', 'ID chủ sở hữu', uuid),
      f('cityId', 'ID thành phố', uuid),
      f('name', 'Tên khách sạn', required.max(255)),
      f('address', 'Địa chỉ', required.max(255)),
      f('description', 'Mô tả (tùy chọn)', z.string()),
      f('starRating', 'Hạng sao', integer(1, 5), '3'),
      f('checkInTime', 'Giờ nhận phòng', time, '14:00'),
      f('checkOutTime', 'Giờ trả phòng', time, '12:00'),
    ],
    body: (v) => ({ ...v, starRating: Number(v.starRating) }),
    response: hotel,
    authenticated: true,
  },
  {
    id: 'room-type',
    title: 'Tạo loại phòng',
    group: hotels,
    method: 'POST',
    path: (v) => hotelPath(v) + '/room-types',
    fields: [
      hotelId,
      f('name', 'Tên loại phòng', required.max(100)),
      f('description', 'Mô tả (tùy chọn)', z.string()),
      f('maxAdults', 'Số người lớn tối đa', integer(1, 32767), '2'),
      f('maxChildren', 'Số trẻ em tối đa', integer(0, 32767), '0'),
    ],
    body: (v) => ({
      name: v.name,
      description: v.description,
      maxAdults: Number(v.maxAdults),
      maxChildren: Number(v.maxChildren),
    }),
    response: z.object({
      id: uuid,
      hotelId: uuid,
      name: z.string(),
      description: z.string().nullable(),
      maxAdults: z.number(),
      maxChildren: z.number(),
      active: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      version: z.number(),
    }),
    authenticated: true,
  },
  {
    id: 'room',
    title: 'Tạo phòng vật lý',
    group: hotels,
    method: 'POST',
    path: (v) => hotelPath(v) + '/rooms',
    fields: [
      hotelId,
      f('roomTypeId', 'ID loại phòng', uuid),
      f('roomNumber', 'Số phòng', required.max(20)),
      f('floor', 'Tầng (tùy chọn)', z.string().max(20)),
      f('operationalFrom', 'Bắt đầu phục vụ (ISO 8601)', instant),
      f(
        'operationalUntil',
        'Kết thúc phục vụ (tùy chọn)',
        z.union([z.literal(''), instant]),
      ),
    ],
    body: (v) => ({
      roomTypeId: v.roomTypeId,
      roomNumber: v.roomNumber,
      floor: v.floor || null,
      operationalFrom: v.operationalFrom,
      operationalUntil: v.operationalUntil || null,
    }),
    response: z
      .object({
        id: uuid,
        hotelId: uuid,
        roomTypeId: uuid,
        roomNumber: z.string(),
        floor: z.string().nullable(),
        readiness: z.string(),
        operationalFrom: z.string(),
        operationalUntil: z.string().nullable(),
        version: z.number(),
      })
      .passthrough(),
    authenticated: true,
  },
  {
    id: 'roles',
    title: 'Danh sách vai trò',
    group: roles,
    method: 'GET',
    path: () => '/admin/roles',
    fields: [],
    response: z.array(
      z.object({ id: z.number(), roleKey: z.string(), roleName: z.string() }),
    ),
    authenticated: true,
  },
  {
    id: 'user-roles',
    title: 'Vai trò của tài khoản',
    group: roles,
    method: 'GET',
    path: rolePath,
    fields: [userId],
    response: userRoles,
    authenticated: true,
  },
  {
    id: 'grant-role',
    title: 'Cấp vai trò',
    group: roles,
    method: 'PUT',
    path: (v) => rolePath(v) + '/' + v.roleId,
    fields: [userId, roleId],
    response: userRoles,
    authenticated: true,
  },
  {
    id: 'revoke-role',
    title: 'Thu hồi vai trò',
    group: roles,
    method: 'DELETE',
    path: (v) => rolePath(v) + '/' + v.roleId,
    fields: [userId, roleId],
    response: userRoles,
    authenticated: true,
  },
]
export function inputSchema(operation: Operation) {
  return z.object(
    Object.fromEntries(
      operation.fields.map((field) => [field.key, field.rule]),
    ),
  )
}
export async function runOperation(
  operation: Operation,
  values: Record<string, string>,
  signal?: AbortSignal,
) {
  const parsed = inputSchema(operation).parse(values)
  const result = await http.request(operation.path(parsed), {
    method: operation.method,
    body: operation.body?.(parsed),
    schema: operation.response,
    signal,
  })
  if (operation.id === 'login' || operation.id === 'refresh') {
    const session = login.parse(result)
    queryClient.clear()
    setSession(session)
    return { user: session.user, expiresAt: session.expiresAt }
  }
  if (['logout', 'password', 'reset-password'].includes(operation.id)) {
    setSession(null)
    queryClient.clear()
  }
  return result
}
