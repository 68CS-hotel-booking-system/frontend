import { unsupportedApi } from '@/shared/api/unsupported-api'
import type { FinancialAccessGrant } from '../model/financial-access'
import type { UpdateFinancialAccessFormValues } from '../model/financial-access-form-schema'

// No financial access controller exists in the current backend.
export const getFinancialAccess: (
  params: { hotelId: string; userId: string },
  signal?: AbortSignal,
) => Promise<FinancialAccessGrant> = () => unsupportedApi('tra cứu quyền tài chính')

export const updateFinancialAccess: (
  params: { hotelId: string; userId: string },
  payload: UpdateFinancialAccessFormValues,
  signal?: AbortSignal,
) => Promise<FinancialAccessGrant> = () => unsupportedApi('cập nhật quyền tài chính')
