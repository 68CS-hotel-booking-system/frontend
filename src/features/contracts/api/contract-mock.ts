import type {
  CreateHotelContractFormValues,
  HotelCommissionContract,
} from '../types/contract'

let mockContractsStore: HotelCommissionContract[] = [
  {
    id: '55555555-5555-4555-8555-555555555501',
    hotelId: '33333333-3333-4333-8333-333333333301',
    contractCode: 'CTR-2026-IHG-01',
    commissionPercentage: 12.5,
    currency: 'VND',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    status: 'ACTIVE',
    termsSummary:
      'Thỏa thuận hoa hồng tiêu chuẩn đối tác chiến lược 5 sao IHG. Đối soát định kỳ ngày 05 và 20 hàng tháng dựa trên khoản thực thu sau voucher của khách sạn.',
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: '2025-12-20T09:00:00Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555502',
    hotelId: '33333333-3333-4333-8333-333333333301',
    contractCode: 'CTR-2027-IHG-DRAFT',
    commissionPercentage: 11.0,
    currency: 'VND',
    effectiveFrom: '2027-01-01',
    effectiveTo: '2027-12-31',
    status: 'DRAFT',
    termsSummary:
      'Dự thảo gia hạn năm 2027 với mức chiết khấu hoa hồng ưu đãi khi sản lượng phòng vượt 1.500 đêm/quý.',
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: '2026-10-15T10:30:00Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555503',
    hotelId: '33333333-3333-4333-8333-333333333302',
    contractCode: 'CTR-2026-GLAMP-01',
    commissionPercentage: 15.0,
    currency: 'VND',
    effectiveFrom: '2026-06-01',
    effectiveTo: '2027-05-31',
    status: 'ACTIVE',
    termsSummary:
      'Hợp đồng đối tác StayVibe Glamping Collection Đà Lạt. Hỗ trợ truyền thông chiến dịch Gen Z Experiential Travel.',
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555504',
    hotelId: '33333333-3333-4333-8333-333333333303',
    contractCode: 'CTR-2026-PQ-RESORT',
    commissionPercentage: 14.0,
    currency: 'VND',
    effectiveFrom: '2026-10-01',
    effectiveTo: '2027-09-30',
    status: 'DRAFT',
    termsSummary:
      'Dự thảo hợp đồng khai trương tổ hợp Beachfront Club & Resort Phú Quốc, áp dụng biểu phí hoa hồng ưu đãi 3 tháng đầu.',
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: '2026-10-05T11:00:00Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555505',
    hotelId: '33333333-3333-4333-8333-333333333304',
    contractCode: 'CTR-2026-HOIAN-01',
    commissionPercentage: 13.5,
    currency: 'VND',
    effectiveFrom: '2026-11-01',
    effectiveTo: '2027-10-31',
    status: 'DRAFT',
    termsSummary:
      'Dự thảo thỏa thuận hoa hồng dành cho khách sạn Boutique văn hóa phố cổ Hội An.',
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: '2026-10-18T14:15:00Z',
  },
]

export async function getMockHotelContracts(
  hotelId: string,
): Promise<HotelCommissionContract[]> {
  return mockContractsStore.filter((item) => item.hotelId === hotelId)
}

export async function createMockHotelContractDraft(
  hotelId: string,
  payload: CreateHotelContractFormValues,
): Promise<HotelCommissionContract> {
  const created: HotelCommissionContract = {
    id: `55555555-5555-4555-8555-${String(Date.now()).slice(-12).padStart(12, '0')}`,
    hotelId,
    contractCode: payload.contractCode,
    commissionPercentage: payload.commissionPercentage,
    currency: payload.currency,
    effectiveFrom: payload.effectiveFrom,
    effectiveTo: payload.effectiveTo,
    status: 'DRAFT',
    termsSummary: payload.termsSummary,
    createdByUserId: '88888888-8888-4888-8888-888888888801',
    createdAt: new Date().toISOString(),
  }
  mockContractsStore = [created, ...mockContractsStore]
  return created
}
