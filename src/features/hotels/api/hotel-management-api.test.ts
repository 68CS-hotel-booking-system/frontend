import { describe, expect, it, vi } from 'vitest'
import {
  createHotelContractDraft,
  getHotelContracts,
} from '@/features/contracts/api/contract-api'
import {
  getFinancialAccess,
  updateFinancialAccess,
} from '@/features/finance/api/financial-access-api'
import {
  getMockFinancialAccess,
  updateMockFinancialAccess,
} from '@/features/finance/api/financial-access-mock'
import { ApiError } from '@/shared/api/api-error'
import { http } from '@/shared/api/http'
import { getAmenities, getCities } from './catalog-api'
import {
  createAdminHotel,
  getManagementHotelDetail,
  getManagementHotels,
  getRoomTypeDailyRates,
  updateHotelAmenities,
  updateManagementHotel,
} from './hotel-management-api'

describe('TV4 Hotel Management, Pricing & Finance API contracts', () => {
  it('calls HT01 /cities and HT02 /amenities with AbortSignal', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValue([])
    const controller = new AbortController()

    await getCities(controller.signal)
    expect(spy).toHaveBeenCalledWith(
      '/cities',
      expect.objectContaining({ signal: controller.signal }),
    )

    await getAmenities(controller.signal)
    expect(spy).toHaveBeenCalledWith(
      '/amenities',
      expect.objectContaining({ signal: controller.signal }),
    )

    spy.mockRestore()
  })

  it('calls HT07 /management/hotels with 0-based page and filters', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValue({
      content: [],
      page: 0,
      size: 6,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    })

    await getManagementHotels({
      page: 0,
      size: 6,
      status: 'ACTIVE',
      keyword: 'Westlake',
    })

    expect(spy).toHaveBeenCalledWith(
      '/management/hotels?page=0&size=6&status=ACTIVE&keyword=Westlake',
      expect.any(Object),
    )

    spy.mockRestore()
  })

  it('calls HT06, HT08, HT09, HT14 and PR01 with exact paths and methods', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValue({})

    await createAdminHotel({
      name: 'StayVibe Test Hotel',
      slug: 'stayvibe-test-hotel',
      cityId: '11111111-1111-4111-8111-111111111101',
      ownerUserId: '99999999-9999-4999-8999-999999999901',
      address: '01 Test Street',
      starRating: 5,
      checkInTime: '14:00',
      checkOutTime: '12:00',
    })
    expect(spy).toHaveBeenCalledWith(
      '/admin/hotels',
      expect.objectContaining({ method: 'POST' }),
    )

    await getManagementHotelDetail('hotel-123')
    expect(spy).toHaveBeenCalledWith(
      '/management/hotels/hotel-123',
      expect.any(Object),
    )

    await updateManagementHotel('hotel-123', {
      name: 'Updated Name',
      cityId: 'city-1',
      address: 'Updated Address',
      starRating: 5,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      description: 'Desc',
      latitude: 21.0,
      longitude: 105.8,
      status: 'ACTIVE',
    })
    expect(spy).toHaveBeenCalledWith(
      '/management/hotels/hotel-123',
      expect.objectContaining({ method: 'PATCH' }),
    )

    await updateHotelAmenities('hotel-123', { amenityIds: ['am-1', 'am-2'] })
    expect(spy).toHaveBeenCalledWith(
      '/management/hotels/hotel-123/amenities',
      expect.objectContaining({ method: 'PUT' }),
    )

    await getRoomTypeDailyRates({
      hotelId: 'hotel-123',
      roomTypeId: 'rt-456',
      startDate: '2026-11-01',
      endDate: '2026-11-07',
    })
    expect(spy).toHaveBeenCalledWith(
      '/management/hotels/hotel-123/room-types/rt-456/rates?startDate=2026-11-01&endDate=2026-11-07',
      expect.any(Object),
    )

    spy.mockRestore()
  })

  it('calls FN01, FN02, FN16 and FN00 finance/contract endpoints accurately', async () => {
    const spy = vi.spyOn(http, 'request').mockResolvedValue({})

    await getHotelContracts('hotel-123')
    expect(spy).toHaveBeenCalledWith(
      '/finance/hotels/hotel-123/contracts',
      expect.any(Object),
    )

    await createHotelContractDraft('hotel-123', {
      contractCode: 'CTR-2027-01',
      commissionPercentage: 12,
      currency: 'VND',
      effectiveFrom: '2027-01-01',
      effectiveTo: '2027-12-31',
      termsSummary: 'Standard commission contract terms.',
    })
    expect(spy).toHaveBeenCalledWith(
      '/admin/hotels/hotel-123/contracts',
      expect.objectContaining({ method: 'POST' }),
    )

    await getFinancialAccess({ hotelId: 'hotel-123', userId: 'user-999' })
    expect(spy).toHaveBeenCalledWith(
      '/admin/hotels/hotel-123/financial-access/user-999',
      expect.any(Object),
    )

    await updateFinancialAccess(
      { hotelId: 'hotel-123', userId: 'user-999' },
      {
        contractId: 'ctr-1',
        status: 'GRANTED',
        canReadContracts: true,
        canReadSettlements: true,
        canExportReports: false,
        expectedVersion: 2,
        reason: 'Approved by partner agreement.',
      },
    )
    expect(spy).toHaveBeenCalledWith(
      '/admin/hotels/hotel-123/financial-access/user-999',
      expect.objectContaining({ method: 'PUT' }),
    )

    spy.mockRestore()
  })

  it('enforces optimistic locking (expectedVersion) on FN00 financial access updates', async () => {
    const current = await getMockFinancialAccess({
      hotelId: '33333333-3333-4333-8333-333333333301',
      userId: '99999999-9999-4999-8999-999999999901',
    })

    await expect(
      updateMockFinancialAccess(
        {
          hotelId: '33333333-3333-4333-8333-333333333301',
          userId: '99999999-9999-4999-8999-999999999901',
        },
        {
          contractId: current.contractId,
          status: 'GRANTED',
          canReadContracts: true,
          canReadSettlements: true,
          canExportReports: true,
          expectedVersion: current.version + 99,
          reason: 'Test version mismatch',
        },
      ),
    ).rejects.toThrowError(ApiError)
  })
})
