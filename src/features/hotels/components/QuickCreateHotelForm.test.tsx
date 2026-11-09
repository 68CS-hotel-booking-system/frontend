import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp } from 'antd'
import { QuickCreateHotelForm } from './QuickCreateHotelForm'

describe('QuickCreateHotelForm component', () => {
  it('renders only the 4 required quick-create fields and guidance, excluding heavy sections', () => {
    const qc = new QueryClient()
    qc.setQueryData(['hotels', 'cities'], [
      { id: '11111111-1111-4111-8111-111111111101', name: 'Đà Nẵng', slug: 'da-nang', countryCode: 'VN' },
      { id: '11111111-1111-4111-8111-111111111102', name: 'Hà Nội', slug: 'ha-noi', countryCode: 'VN' },
    ])

    const markup = renderToStaticMarkup(
      <QueryClientProvider client={qc}>
        <AntApp>
          <QuickCreateHotelForm onSuccess={vi.fn()} onCancel={vi.fn()} />
        </AntApp>
      </QueryClientProvider>,
    )

    // Quick guide present
    expect(markup).toContain('Quy trình tạo hồ sơ nhanh')
    expect(markup).toContain('Bản nháp (DRAFT)')

    // 4 required fields present
    expect(markup).toContain('Tên khách sạn chính thức')
    expect(markup).toContain('Tiêu chuẩn sao')
    expect(markup).toContain('Tỉnh / Thành phố')
    expect(markup).toContain('Chủ sở hữu (Owner User ID)')
    expect(markup).toContain('Sao chép ID')

    // Submit & Cancel buttons present
    expect(markup).toContain('Tạo khách sạn')
    expect(markup).toContain('Hủy / Quay lại')

    // Excluded fields removed from /hotels/new
    expect(markup).not.toContain('Mô tả &amp; Điểm nổi bật')
    expect(markup).not.toContain('Giờ nhận phòng (Check-in)')
    expect(markup).not.toContain('Giờ trả phòng (Check-out)')
    expect(markup).not.toContain('Vị trí &amp; Tọa độ định vị GPS')
    expect(markup).not.toContain('Thư viện hình ảnh khách sạn')
    expect(markup).not.toContain('map-frame')
  })
})
