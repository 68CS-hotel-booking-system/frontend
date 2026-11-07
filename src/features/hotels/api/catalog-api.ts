import { unsupportedApi } from '@/shared/api/unsupported-api'
import type { AmenityItem, CityItem } from '../model/hotel'

// No city / amenity controllers exist in the current backend.
export const getCities: (signal?: AbortSignal) => Promise<CityItem[]> = () =>
  unsupportedApi('danh mục thành phố; hãy nhập City ID từ cơ sở dữ liệu')

export const getAmenities: (signal?: AbortSignal) => Promise<AmenityItem[]> = () =>
  unsupportedApi('danh mục tiện ích')
