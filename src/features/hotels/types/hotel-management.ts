import { z } from 'zod'

/** Enum hotel_status__t đúng theo nguồn business-rules.md */
export const hotelStatusValues = [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'REJECTED',
  'SUSPENDED',
] as const

export const hotelStatusSchema = z.enum(hotelStatusValues)
export type HotelStatus = z.infer<typeof hotelStatusSchema>

/** Enum amenity_category__t đúng theo nguồn business-rules.md */
export const amenityCategoryValues = ['HOTEL', 'ROOM'] as const
export const amenityCategorySchema = z.enum(amenityCategoryValues)
export type AmenityCategory = z.infer<typeof amenityCategorySchema>

/** HT01: GET /api/v1/cities */
export const citySchema = z.object({
  id: z.string().min(1),
  countryCode: z.string().length(2),
  name: z.string().min(1),
  slug: z.string().min(1),
})
export type CityItem = z.infer<typeof citySchema>

/** HT02: GET /api/v1/amenities */
export const amenitySchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  category: amenityCategorySchema,
})
export type AmenityItem = z.infer<typeof amenitySchema>

/** Tóm tắt loại phòng thuộc khách sạn (phục vụ PR01 xem giá theo ngày) */
export const managementRoomTypeSummarySchema = z.object({
  id: z.string().min(1),
  hotelId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  maxAdults: z.number().int().min(1),
  maxChildren: z.number().int().min(0),
  isActive: z.boolean(),
  totalRooms: z.number().int().min(0).optional(),
})
export type ManagementRoomTypeSummary = z.infer<typeof managementRoomTypeSummarySchema>

/** HT07: GET /api/v1/management/hotels (Item trong danh sách phân trang) */
export const managementHotelSummarySchema = z.object({
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  ownerName: z.string().optional(),
  cityId: z.string().min(1),
  cityName: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  address: z.string().min(1),
  starRating: z.number().int().min(1).max(5).nullable(),
  checkInTime: z.string().min(4),
  checkOutTime: z.string().min(4),
  status: hotelStatusSchema,
  coverImageUrl: z.string().nullable().optional(),
  vibeTags: z.array(z.string()).optional(),
  roomTypeCount: z.number().int().min(0).optional(),
  updatedAt: z.string(),
})
export type ManagementHotelSummary = z.infer<typeof managementHotelSummarySchema>

/** Phân trang chuẩn PageResponse bắt đầu từ page = 0 */
export const managementHotelPageSchema = z.object({
  content: z.array(managementHotelSummarySchema),
  page: z.number().int().min(0),
  size: z.number().int().min(1),
  totalElements: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  first: z.boolean(),
  last: z.boolean(),
})
export type ManagementHotelPage = z.infer<typeof managementHotelPageSchema>

/** HT08: GET /api/v1/management/hotels/{hotelId} */
export const managementHotelDetailSchema = managementHotelSummarySchema.extend({
  description: z.string().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  amenityIds: z.array(z.string()),
  roomTypes: z.array(managementRoomTypeSummarySchema),
  createdAt: z.string(),
})
export type ManagementHotelDetail = z.infer<typeof managementHotelDetailSchema>

const timeFormatRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** HT06: POST /api/v1/admin/hotels — Tạo khách sạn và phân công Owner */
export const createAdminHotelFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Tên khách sạn cần ít nhất 3 ký tự.')
    .max(255, 'Tên khách sạn tối đa 255 ký tự.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug cần ít nhất 3 ký tự.')
    .max(255, 'Slug tối đa 255 ký tự.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'),
  cityId: z.string().min(1, 'Vui lòng chọn thành phố.'),
  ownerUserId: z
    .string()
    .trim()
    .regex(uuidRegex, 'Owner User ID phải đúng định dạng UUID.'),
  address: z
    .string()
    .trim()
    .min(5, 'Địa chỉ cần ít nhất 5 ký tự.')
    .max(255, 'Địa chỉ tối đa 255 ký tự.'),
  starRating: z
    .number({ error: 'Chọn hạng sao từ 1 đến 5.' })
    .int()
    .min(1, 'Hạng sao từ 1 đến 5.')
    .max(5, 'Hạng sao từ 1 đến 5.'),
  checkInTime: z
    .string()
    .regex(timeFormatRegex, 'Giờ nhận phòng theo định dạng HH:mm (ví dụ 14:00).'),
  checkOutTime: z
    .string()
    .regex(timeFormatRegex, 'Giờ trả phòng theo định dạng HH:mm (ví dụ 12:00).'),
  description: z.string().trim().max(2000, 'Mô tả tối đa 2000 ký tự.').optional(),
  latitude: z
    .number({ error: 'Vĩ độ phải là số hợp lệ.' })
    .min(-90, 'Vĩ độ trong khoảng -90 đến 90.')
    .max(90, 'Vĩ độ trong khoảng -90 đến 90.')
    .nullable()
    .optional(),
  longitude: z
    .number({ error: 'Kinh độ phải là số hợp lệ.' })
    .min(-180, 'Kinh độ trong khoảng -180 đến 180.')
    .max(180, 'Kinh độ trong khoảng -180 đến 180.')
    .nullable()
    .optional(),
})
export type CreateAdminHotelFormValues = z.infer<typeof createAdminHotelFormSchema>

/** HT09: PATCH /api/v1/management/hotels/{hotelId} — Sửa nội dung khách sạn */
export const updateManagementHotelFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Tên khách sạn cần ít nhất 3 ký tự.')
    .max(255, 'Tên khách sạn tối đa 255 ký tự.'),
  cityId: z.string().min(1, 'Vui lòng chọn thành phố.'),
  address: z
    .string()
    .trim()
    .min(5, 'Địa chỉ cần ít nhất 5 ký tự.')
    .max(255, 'Địa chỉ tối đa 255 ký tự.'),
  starRating: z.number().int().min(1).max(5),
  checkInTime: z
    .string()
    .regex(timeFormatRegex, 'Giờ nhận phòng theo định dạng HH:mm.'),
  checkOutTime: z
    .string()
    .regex(timeFormatRegex, 'Giờ trả phòng theo định dạng HH:mm.'),
  description: z.string().trim().max(2000, 'Mô tả tối đa 2000 ký tự.'),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  status: hotelStatusSchema,
})
export type UpdateManagementHotelFormValues = z.infer<typeof updateManagementHotelFormSchema>

/** HT14: PUT /api/v1/management/hotels/{hotelId}/amenities */
export const updateHotelAmenitiesFormSchema = z.object({
  amenityIds: z.array(z.string().min(1)),
})
export type UpdateHotelAmenitiesFormValues = z.infer<typeof updateHotelAmenitiesFormSchema>

/** PR01: GET /api/v1/management/hotels/{hotelId}/room-types/{roomTypeId}/rates */
export const dailyRoomRateSchema = z.object({
  roomTypeId: z.string().min(1),
  rateDate: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
})
export type DailyRoomRate = z.infer<typeof dailyRoomRateSchema>

export interface ManagementHotelListQuery {
  page?: number
  size?: number
  cityId?: string
  status?: HotelStatus | 'ALL'
  keyword?: string
  vibe?: string
}

