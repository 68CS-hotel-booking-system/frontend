import { useState } from 'react'
import {
  CheckOutlined,
  DownOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { Popover } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import { useHotelWorkspace } from '../context/hotel-workspace-context'
import { useManagementHotelsQuery } from '../hooks/use-hotel-list-query'

export function HotelSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { hotel, hotelId, completion } = useHotelWorkspace()

  // Danh sách khách sạn của owner để switch
  const hotelsQuery = useManagementHotelsQuery({ page: 0, size: 50 })
  const allHotels = hotelsQuery.data?.content ?? []

  // Khách sạn A hiện tại và các khách sạn khác (B, C...)
  const currentHotel = allHotels.find((h) => h.id === hotelId) || hotel
  const otherHotels = allHotels.filter((h) => h.id !== hotelId)

  // Trích xuất sub-path hiện tại: /hotels/:hotelId(/subpath...)
  const handleSelectHotel = (targetId: string) => {
    if (targetId === hotelId) {
      setOpen(false)
      return
    }

    const segments = location.pathname.split('/').filter(Boolean)
    // segments[0] = 'hotels', segments[1] = hotelId, segments[2...] = subpath
    const subPath = segments.slice(2).join('/')
    const nextUrl = subPath ? `/hotels/${targetId}/${subPath}` : `/hotels/${targetId}`

    setOpen(false)
    void navigate(nextUrl)
  }

  const hotelName = hotel?.name || currentHotel?.name || 'Đang tải...'

  const popoverContent = (
    <div className="w-[320px] max-w-[calc(100vw-32px)] p-1 flex flex-col gap-1">
      {/* Khách sạn A (Cơ sở hiện tại) */}
      {currentHotel && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#eef8f5] text-[#0b5f53] font-semibold text-xs border border-[#bcd8cf]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0b5f53] text-white flex items-center justify-center shrink-0 text-sm">
              <ShopOutlined />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-[#08473e]">{currentHotel.name}</div>
              <div className="text-[11px] text-[#5f736e] truncate font-normal">
                {currentHotel.cityName || currentHotel.address || 'Cơ sở hiện tại'}
              </div>
            </div>
          </div>
          <CheckOutlined className="text-[#0b5f53] shrink-0 text-xs ml-2" />
        </div>
      )}

      {/* Các cơ sở khác (B, C...) hiển thị ngay dưới A */}
      {otherHotels.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleSelectHotel(item.id)}
          className="flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs border-0 cursor-pointer bg-transparent text-[#12211d] hover:bg-[#f4f8f7]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#eef3f1] text-[#55655f] flex items-center justify-center shrink-0 text-sm">
              <ShopOutlined />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-[#12211d]">{item.name}</div>
              <div className="text-[11px] text-[#5f736e] truncate font-normal">
                {item.cityName || item.address || 'Cơ sở lưu trú'}
              </div>
            </div>
          </div>
        </button>
      ))}

      {otherHotels.length === 0 && (
        <div className="px-3 py-2 text-[11px] text-[#8c9e99] text-center">
          Chỉ có 1 cơ sở lưu trú
        </div>
      )}
    </div>
  )

  return (
    <div className="hotel-switcher-container">
      <Popover
        content={popoverContent}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
      >
        <button
          type="button"
          className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#dce7e3] bg-white hover:bg-[#f7fbfa] hover:border-[#bcd8cf] transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0b5f53]/20 shadow-2xs"
          aria-label={`Khách sạn hiện tại: ${hotelName}. Bấm để đổi khách sạn.`}
          aria-expanded={open}
        >
          <div className="w-8 h-8 rounded-lg bg-[#eef8f5] text-[#0b5f53] flex items-center justify-center shrink-0">
            <ShopOutlined className="text-base" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8c9e99] leading-none">
              Cơ sở đang quản lý
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-xs sm:text-sm font-semibold text-[#12211d] truncate max-w-[160px] sm:max-w-[260px]">
                {hotelName}
              </strong>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#0b5f53] bg-[#eef8f5] px-2 py-0.5 rounded-full shrink-0">
            Hoàn thiện {completion.percent}%
          </span>
          <DownOutlined
            className={`text-[10px] text-[#5f736e] shrink-0 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </Popover>
    </div>
  )
}
