import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AmenityScopeEditor } from './AmenityScopeEditor'
import { hotelManagementKeys as keys } from '../hooks/hotel-query-keys'
const hotelId = '11111111-1111-4111-8111-111111111111'
const typeId = '22222222-2222-4222-8222-222222222222'
const item = { id: '33333333-3333-4333-8333-333333333333', code: 'BATH', name: 'Bồn tắm', category: 'ROOM' as const }
function fixture() { const client = new QueryClient(); client.setQueryData(keys.amenities('api:ROOM'), [item]); client.setQueryData(keys.roomTypeAmenities(hotelId, typeId), [item]); return client }
describe('scope amenity editor', () => {
  it('keeps a type read-only without exposing a custom-type mutation', () => {
    const markup = renderToStaticMarkup(<QueryClientProvider client={fixture()}><App><AmenityScopeEditor hotelId={hotelId} target={{scope:'roomType',id:typeId,name:'Deluxe'}} readOnly /></App></QueryClientProvider>)
    expect(markup).toContain('Chế độ chỉ đọc'); expect(markup).toContain('disabled'); expect(markup).toContain('Chưa có chức năng tạo tiện ích riêng cho hạng phòng'); expect(markup).not.toContain('Lưu thay đổi')
  })
  it('identifies shared hotel services separately from direct room-type amenities', () => {
    const markup = renderToStaticMarkup(<QueryClientProvider client={fixture()}><App><AmenityScopeEditor hotelId={hotelId} target={{scope:'roomType',id:typeId,name:'Deluxe'}} inheritedSources={[{key:'hotel', label:'Dịch vụ chung từ khách sạn',items:[{...item,id:hotelId,name:'Hồ bơi',category:'HOTEL'}]}]} /></App></QueryClientProvider>)
    expect(markup).toContain('Dịch vụ chung từ khách sạn'); expect(markup).toContain('Hồ bơi'); expect(markup).toContain('Bồn tắm'); expect(markup).not.toContain('Lưu thay đổi')
  })
})
