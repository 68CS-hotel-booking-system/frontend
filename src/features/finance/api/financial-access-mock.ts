import { ApiError } from '@/shared/api/api-error'
import type {
  FinancialAccessGrant,
  UpdateFinancialAccessFormValues,
} from '../types/financial-access'

export interface MockRepresentativeCandidate {
  userId: string
  fullName: string
  email: string
  roleLabel: string
  memberRole: 'OWNER' | 'MANAGER' | 'RECEPTIONIST'
}

export const MOCK_REPRESENTATIVE_CANDIDATES: MockRepresentativeCandidate[] = [
  {
    userId: '99999999-9999-4999-8999-999999999901',
    fullName: 'Nguyễn Minh Quân',
    email: 'quan.nguyen@ihg-westlake.vn',
    roleLabel: 'Chủ sở hữu khách sạn (Owner)',
    memberRole: 'OWNER',
  },
  {
    userId: '77777777-7777-4777-8777-777777777701',
    fullName: 'Đỗ Thu Trang',
    email: 'trang.do.finance@ihg-westlake.vn',
    roleLabel: 'Kế toán trưởng / Đại diện tài chính (MANAGER)',
    memberRole: 'MANAGER',
  },
  {
    userId: '77777777-7777-4777-8777-777777777702',
    fullName: 'Phạm Tuấn Kiệt',
    email: 'kiet.pham.fo@ihg-westlake.vn',
    roleLabel: 'Trưởng bộ phận Lễ tân (RECEPTIONIST)',
    memberRole: 'RECEPTIONIST',
  },
  {
    userId: '99999999-9999-4999-8999-999999999902',
    fullName: 'Lê Hoàng Thảo Vy',
    email: 'vy.le@cloudpine-dalat.vn',
    roleLabel: 'Chủ sở hữu CloudPine (Owner)',
    memberRole: 'OWNER',
  },
]

const mockGrantsMap = new Map<string, FinancialAccessGrant>([
  [
    '33333333-3333-4333-8333-333333333301:99999999-9999-4999-8999-999999999901',
    {
      hotelId: '33333333-3333-4333-8333-333333333301',
      userId: '99999999-9999-4999-8999-999999999901',
      userFullName: 'Nguyễn Minh Quân',
      userEmail: 'quan.nguyen@ihg-westlake.vn',
      contractId: '55555555-5555-4555-8555-555555555501',
      contractCode: 'CTR-2026-IHG-01',
      status: 'GRANTED',
      canReadContracts: true,
      canReadSettlements: true,
      canExportReports: true,
      version: 3,
      previousVersionSummary:
        'v2 (2026-06-12): GRANTED · Đọc hợp đồng & đối soát (chưa bật xuất báo cáo CSV)',
      updatedAt: '2026-10-20T15:00:00Z',
      reason:
        'Phân quyền đầy đủ cho đại diện chủ sở hữu theo phụ lục hợp đồng Q4/2026.',
    },
  ],
  [
    '33333333-3333-4333-8333-333333333301:77777777-7777-4777-8777-777777777701',
    {
      hotelId: '33333333-3333-4333-8333-333333333301',
      userId: '77777777-7777-4777-8777-777777777701',
      userFullName: 'Đỗ Thu Trang',
      userEmail: 'trang.do.finance@ihg-westlake.vn',
      contractId: '55555555-5555-4555-8555-555555555501',
      contractCode: 'CTR-2026-IHG-01',
      status: 'GRANTED',
      canReadContracts: true,
      canReadSettlements: true,
      canExportReports: false,
      version: 1,
      previousVersionSummary: 'v0: Chưa cấp quyền tài chính',
      updatedAt: '2026-09-01T10:00:00Z',
      reason:
        'Cấp quyền tra cứu hợp đồng và kỳ đối soát cho kế toán trưởng khách sạn.',
    },
  ],
  [
    '33333333-3333-4333-8333-333333333302:99999999-9999-4999-8999-999999999902',
    {
      hotelId: '33333333-3333-4333-8333-333333333302',
      userId: '99999999-9999-4999-8999-999999999902',
      userFullName: 'Lê Hoàng Thảo Vy',
      userEmail: 'vy.le@cloudpine-dalat.vn',
      contractId: '55555555-5555-4555-8555-555555555503',
      contractCode: 'CTR-2026-GLAMP-01',
      status: 'GRANTED',
      canReadContracts: true,
      canReadSettlements: true,
      canExportReports: true,
      version: 2,
      previousVersionSummary:
        'v1 (2026-06-01): GRANTED · Đọc hợp đồng cơ bản khi ký thỏa thuận mới',
      updatedAt: '2026-10-10T09:30:00Z',
      reason: 'Mở toàn quyền đối soát và xuất báo cáo cho chủ sở hữu CloudPine.',
    },
  ],
])

export async function getMockFinancialAccess(params: {
  hotelId: string
  userId: string
}): Promise<FinancialAccessGrant> {
  const key = `${params.hotelId}:${params.userId}`
  const existing = mockGrantsMap.get(key)
  if (existing) return existing

  const candidate = MOCK_REPRESENTATIVE_CANDIDATES.find(
    (item) => item.userId === params.userId,
  )

  return {
    hotelId: params.hotelId,
    userId: params.userId,
    userFullName: candidate?.fullName ?? `User (${params.userId.slice(0, 8)}...)`,
    userEmail: candidate?.email ?? 'representative@partner-hotel.vn',
    contractId: '55555555-5555-4555-8555-555555555501',
    contractCode: 'CTR-2026-IHG-01',
    status: 'REVOKED',
    canReadContracts: false,
    canReadSettlements: false,
    canExportReports: false,
    version: 1,
    previousVersionSummary:
      'v0: Bản ghi khởi tạo mặc định (chưa kích hoạt quyền đọc tài chính)',
    updatedAt: new Date().toISOString(),
    reason: 'Chưa cấp quyền tài chính cho tài khoản này.',
  }
}

export async function updateMockFinancialAccess(
  params: { hotelId: string; userId: string },
  payload: UpdateFinancialAccessFormValues,
): Promise<FinancialAccessGrant> {
  const current = await getMockFinancialAccess(params)

  if (payload.expectedVersion !== current.version) {
    throw new ApiError(
      `Xung đột phiên bản (409 Conflict): Phiên bản trên máy chủ hiện là v${current.version}, nhưng yêu cầu gửi lên expectedVersion = v${payload.expectedVersion}. Vui lòng tải lại dữ liệu FN16 trước khi lưu.`,
      {
        kind: 'http',
        status: 409,
        code: 'FINANCIAL_ACCESS_VERSION_CONFLICT',
        errors: [
          {
            field: 'expectedVersion',
            message: `Phiên bản hiện tại là ${current.version}. Hãy đồng bộ lại phiên bản mới nhất.`,
          },
        ],
      },
    )
  }

  const key = `${params.hotelId}:${params.userId}`
  const nextVersion = current.version + 1

  const updated: FinancialAccessGrant = {
    ...current,
    contractId: payload.contractId,
    status: payload.status,
    canReadContracts:
      payload.status === 'REVOKED' ? false : payload.canReadContracts,
    canReadSettlements:
      payload.status === 'REVOKED' ? false : payload.canReadSettlements,
    canExportReports:
      payload.status === 'REVOKED' ? false : payload.canExportReports,
    version: nextVersion,
    previousVersionSummary: `v${current.version} (${current.updatedAt.slice(0, 10)}): ${current.status} · Hợp đồng=${current.canReadContracts ? 'Có' : 'Không'}, Đối soát=${current.canReadSettlements ? 'Có' : 'Không'}, Xuất BC=${current.canExportReports ? 'Có' : 'Không'}`,
    updatedAt: new Date().toISOString(),
    reason: payload.reason,
  }

  mockGrantsMap.set(key, updated)
  return updated
}
