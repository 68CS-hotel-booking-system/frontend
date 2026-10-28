/**
 * Định dạng số tiền hiển thị theo đơn vị tiền tệ (không tự tính toán lại giá/tồn/voucher).
 */
export function formatCurrencyAmount(amount: number, currency = 'VND'): string {
  const normalizedCurrency = currency.trim().toUpperCase() || 'VND'
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: normalizedCurrency === 'VND' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString('vi-VN')} ${normalizedCurrency}`
  }
}

/**
 * Chuẩn hóa chuỗi tên khách sạn thành slug URL thân thiện (hỗ trợ tiếng Việt).
 */
export function slugifyHotelName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

