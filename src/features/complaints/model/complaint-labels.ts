export const complaintCategoryLabels: Record<string, string> = {
  ROOM_CONDITION: 'Tình trạng phòng', SERVICE_QUALITY: 'Chất lượng dịch vụ', STAFF_BEHAVIOR: 'Thái độ nhân viên',
  BILLING: 'Thanh toán / hóa đơn', CANCELLATION_REFUND: 'Hủy / hoàn tiền', OFF_PLATFORM_PAYMENT: 'Yêu cầu thanh toán ngoài hệ thống', OTHER: 'Khác',
}

export const complaintStatusLabels: Record<string, string> = { OPEN: 'Đã tiếp nhận', IN_REVIEW: 'Đang xử lý', RESOLVED: 'Đã giải quyết', REJECTED: 'Đã từ chối' }
export const complaintStatusColors: Record<string, string> = { OPEN: 'blue', IN_REVIEW: 'orange', RESOLVED: 'green', REJECTED: 'red' }
