export const contractSalesLabels: Record<string, string> = {
  EFFECTIVE: 'Còn hiệu lực', EXPIRED: 'Hết hạn', SCHEDULED: 'Chưa đến ngày hiệu lực',
  MISSING: 'Chưa có hợp đồng', DRAFT: 'Dự thảo', TERMINATED: 'Đã chấm dứt',
  UNSUPPORTED: 'Cần thay hợp đồng',
}

export function isContractEndingSoon(endsAt: string | null, now = Date.now()) {
  if (!endsAt) return false
  const remaining = Date.parse(endsAt) - now
  return remaining > 0 && remaining <= 7 * 86400000
}
