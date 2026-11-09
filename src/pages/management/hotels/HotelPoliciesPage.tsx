import { Alert, Button, Form, Input, Select, TimePicker } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useHotelWorkspace } from '@/features/hotels'
import { PageHeader } from '@/shared/ui/PageHeader'

export function HotelPoliciesPage() {
  const { hotel, hotelId } = useHotelWorkspace()

  if (!hotel) return null

  const breadcrumbItems = [
    { label: 'Khách sạn', to: '/hotels' },
    { label: hotel.name, to: `/hotels/${hotelId}` },
    { label: 'Chính sách' },
  ]

  return (
    <div className="hotel-policies-page max-w-4xl">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        kicker="QUY ĐỊNH LƯU TRÚ"
        title="Chính sách &amp; Quy định"
        description="Quy định giờ nhận phòng, trả phòng, chính sách hủy phòng và các quy tắc áp dụng cho khách lưu trú."
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled
            className="!bg-[#0b5f53]"
          >
            Lưu chính sách
          </Button>
        }
      />

      <Alert type="info" showIcon title="Backend chưa có API lưu chính sách. Chỉ có giờ nhận/trả phòng là dữ liệu đã được lưu khi tạo khách sạn." />

      <div className="bg-white p-6 rounded-2xl border border-[#dce7e3] shadow-xs">
        <Form layout="vertical" disabled>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Giờ nhận phòng tiêu chuẩn" required>
              <TimePicker
                format="HH:mm"
                className="w-full"
                defaultValue={dayjs(`2026-01-01 ${hotel.checkInTime || '14:00'}`)}
              />
            </Form.Item>

            <Form.Item label="Giờ trả phòng tiêu chuẩn" required>
              <TimePicker
                format="HH:mm"
                className="w-full"
                defaultValue={dayjs(`2026-01-01 ${hotel.checkOutTime || '12:00'}`)}
              />
            </Form.Item>
          </div>

          <Form.Item label="Chính sách hủy phòng">
            <Select
              placeholder="Chưa có dữ liệu chính sách từ backend"
              options={[
                { label: 'Linh hoạt: Miễn phí hủy trước 24 giờ nhận phòng', value: 'flexible_24h' },
                { label: 'Trung bình: Miễn phí hủy trước 48 giờ nhận phòng', value: 'moderate_48h' },
                { label: 'Nghiêm ngặt: Không hoàn tiền nếu hủy trong vòng 7 ngày', value: 'strict_7d' },
                { label: 'Không hoàn hủy (Non-refundable)', value: 'non_refundable' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Quy định độ tuổi &amp; Trẻ em">
            <Input.TextArea
              rows={3}
              placeholder="Chưa có dữ liệu chính sách từ backend"
            />
          </Form.Item>

          <Form.Item label="Ghi chú nhận phòng">
            <Input.TextArea
              rows={3}
              placeholder="Vui lòng mang theo CMND/CCCD hoặc Hộ chiếu khi làm thủ tục check-in..."
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
