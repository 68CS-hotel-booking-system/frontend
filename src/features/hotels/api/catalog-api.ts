import { z } from 'zod'
import { http } from '@/shared/api/http'
import { amenitySchema, citySchema } from '../types/hotel-management'

/**
 * HT01: GET /api/v1/cities — Danh mục thành phố (dùng chung cho cả TV3 và TV4).
 */
export function getCities(signal?: AbortSignal) {
  return http.request('/cities', {
    signal,
    schema: z.array(citySchema),
  })
}

/**
 * HT02: GET /api/v1/amenities — Danh mục tiện ích (dùng chung cho cả TV3 và TV4).
 */
export function getAmenities(signal?: AbortSignal) {
  return http.request('/amenities', {
    signal,
    schema: z.array(amenitySchema),
  })
}

