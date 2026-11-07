import { unsupportedApi } from '@/shared/api/unsupported-api'
import type { CreateHotelContractFormValues } from '../model/contract-form-schema'
import type { HotelCommissionContract } from '../model/contract'

// Finance contracts are a mock preview until the backend implements this module.
export const getHotelContracts: (
  hotelId: string,
  signal?: AbortSignal,
) => Promise<HotelCommissionContract[]> = () => unsupportedApi('tra cứu hợp đồng khách sạn')

export const createHotelContractDraft: (
  hotelId: string,
  payload: CreateHotelContractFormValues,
  signal?: AbortSignal,
) => Promise<HotelCommissionContract> = () => unsupportedApi('tạo hợp đồng khách sạn')
