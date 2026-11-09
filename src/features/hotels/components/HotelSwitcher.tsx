import { useMemo, useState } from 'react'
import {
  CheckOutlined,
  DownOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { Input, Popover, Progress } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router'
import { useHotelWorkspace } from '../context/hotel-workspace-context'
import { HotelStatusBadge } from './HotelStatusBadge'
import { useManagementHotelsQuery } from '../hooks/use-hotel-list-query'

export function HotelSwitcher() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { hotel, hotelId, completion } = useHotelWorkspace()

  // Danh sách khách sạn của owner để switch
  const hotelsQuery = useManagementHotelsQuery({ page: 0, size: 50 })

  // Lọc theo tìm kiếm
  const filteredHotels = useMemo(() => {
    const list = hotelsQuery.data?.content ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase().trim()
    return list.filter((h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q))
  }, [hotelsQuery.data?.content, search])

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
    navigate(nextUrl)
  }

  const popoverContent = (
    <div className="w-[280px] p-1 flex flex-col gap-2">
      <Input
        prefix={<SearchOutlined className="text-[#8c9e99]" />}
        placeholder="Tìm kiếm khách sạn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        allowClear
        autoFocus
      />

      <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1 py-1">
        {filteredHotels.length === 0 ? (
          <div className="text-xs text-[#8c9e99] text-center py-4">
            Không tìm thấy khách sạn
          </div>
        ) : (
          filteredHotels.map((item) => {
            const isCurrent = item.id === hotelId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectHotel(item.id)}
                className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs border-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#d9f0ea] text-[#08473e] font-semibold'
                    : 'bg-transparent text-[#12211d] hover:bg-[#f7fbfa]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-[10.5px] text-[#5f736e] truncate">{item.cityName || item.address}</div>
                </div>
                {isCurrent && <CheckOutlined className="text-[#0b5f53] shrink-0" />}
              </button>
            )
          })
        )}
      </div>

      <div className="pt-2 border-t border-[#dce7e3] flex items-center justify-between text-xs font-semibold">
        <Link
          to="/hotels"
          onClick={() => setOpen(false)}
          className="text-[#0b5f53] hover:underline"
        >
          Xem tất cả khách sạn
        </Link>
        <Link
          to="/hotels/new"
          onClick={() => setOpen(false)}
          className="text-[#0b5f53] hover:underline flex items-center gap-1"
        >
          <PlusOutlined /> Thêm mới
        </Link>
      </div>
    </div>
  )

  const hotelName = hotel?.name || 'Đang tải...'

  return (
    <div className="hotel-switcher-container p-3 border-b border-[#dce7e3]">
      <Popover
        content={popoverContent}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
      >
        <button
          type="button"
          className="w-full text-left bg-[#f7fbfa] hover:bg-[#eef8f5] p-2.5 rounded-xl border border-[#dce7e3] transition-colors cursor-pointer flex flex-col gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0b5f53]/30"
          aria-label={`Khách sạn hiện tại: ${hotelName}. Bấm để đổi khách sạn.`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-[#12211d] truncate flex items-center gap-1.5 min-w-0">
              <ShopOutlined className="text-[#0b5f53] shrink-0" />
              <span className="truncate">{hotelName}</span>
            </span>
            <DownOutlined className="text-[10px] text-[#5f736e] shrink-0" />
          </div>

          <div className="flex items-center justify-between gap-2">
            {hotel && <HotelStatusBadge status={hotel.status} />}
            <span className="text-[10.5px] text-[#5f736e] font-medium shrink-0">
              Hoàn thiện {completion.percent}%
            </span>
          </div>

          <Progress
            percent={completion.percent}
            showInfo={false}
            size={['100%', 4]}
            strokeColor="#0b5f53"
            railColor="#e0e8e6"
            className="!m-0"
          />
        </button>
      </Popover>
    </div>
  )
}
