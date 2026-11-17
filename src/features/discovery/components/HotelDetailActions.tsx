import { useContext } from 'react'
import { App } from 'antd'
import { ClientHomeContext } from '../context/client-home-context-def'
import { HotelDetailIcon } from './HotelDetailIcon'

export function HotelDetailActions({ hotelId, name }: { hotelId: string; name: string }) {
  const context = useContext(ClientHomeContext)
  const { message } = App.useApp()
  const saved = context?.savedIds.has(hotelId) ?? false
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: name, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); void message.success('Đã sao chép liên kết khách sạn.') }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) void message.error('Không thể chia sẻ liên kết. Vui lòng sao chép địa chỉ trên trình duyệt.') }
  }
  return <div className="hotel-detail-actions"><button type="button" onClick={() => void share()}><HotelDetailIcon name="share" /><span>Chia sẻ</span></button><button type="button" aria-pressed={saved} onClick={() => context?.toggleSaved(hotelId)}><HotelDetailIcon name="heart" /><span>{saved ? 'Đã lưu' : 'Lưu'}</span></button></div>
}
