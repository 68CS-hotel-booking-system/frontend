import { useMemo, useState } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Dropdown, Select, Space, Tag } from 'antd'
import { useNavigate } from 'react-router'
import { CreateAdminHotelDrawer } from '@/features/hotels/components/CreateAdminHotelDrawer'
import { CreatePhysicalRoomDrawer } from '@/features/hotels/components/CreatePhysicalRoomDrawer'
import { CreateRoomTypeDrawer } from '@/features/hotels/components/CreateRoomTypeDrawer'
import { HotelStatusBadge } from '@/features/hotels/components/HotelStatusBadge'
import {
  useCitiesQuery,
  useManagementHotelDetailQuery,
  useManagementHotelsQuery,
  usePhysicalRoomsByHotelQuery,
} from '@/features/hotels/hooks/use-hotel-management'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

type FloorFilterId = 'all' | 'floor-1-3' | 'penthouse'
type ReservationStatusFilter = 'all' | 'in-house' | 'confirmed' | 'vip'

interface ReservationRowItem {
  id: string
  resCode: string
  guestName: string
  guestEmail: string
  avatarUrl?: string
  initials?: string
  badgeText?: string
  badgeType?: 'vip' | 'repeat'
  roomTitle: string
  roomSubtitle: string
  floorGroup: FloorFilterId
  stayDates: string
  stayMeta: string
  usdFolio: string
  vndFolio: string
  statusText: string
  statusVariant: 'checked-in' | 'eta' | 'confirmed'
  categories: ReservationStatusFilter[]
}

const INITIAL_RESERVATIONS: ReservationRowItem[] = [
  {
    id: 'res-9482',
    resCode: '#RES-9482',
    guestName: 'Eleanor Vance',
    guestEmail: 'eleanor.vance@vanceholdings.com',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGLAEAib7EN6PiuWPN5nyeeN4DqqPAEcy1Ey1xelRYz_lTV1VKhfF6QMgzCUppZtVJWZLzaaO5kQA8_ftFEKHaCwwSn6k4PCPT_r_N9m9s61r6MTtZj3dfAjBi7ef5EE5k45Q-TG-c9tT-X8QwfRsPdNCebmqKa3__8Mzx4EF6gepBAPo6JEcgnN1-09icv37QIPtO3SFBd_iJYWupYWnm_R3YoeJH7jFb57yNzCs',
    initials: 'EV',
    badgeText: 'VIP Kim Cương',
    badgeType: 'vip',
    roomTitle: 'Suite 402 • Penthouse Hoàng Gia',
    roomSubtitle: 'Tầng 4 • Sân thượng riêng & Quản gia',
    floorGroup: 'penthouse',
    stayDates: '18/10 – 22/10',
    stayMeta: '4 đêm (Đêm 2/4)',
    usdFolio: '$4,280.00',
    vndFolio: '108,500,000 ₫',
    statusText: 'Đang lưu trú',
    statusVariant: 'checked-in',
    categories: ['all', 'in-house', 'vip'],
  },
  {
    id: 'res-9479',
    resCode: '#RES-9479',
    guestName: 'Marcus Chen',
    guestEmail: 'mchen.design@tokyo.io',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1mEViqHKv3npcdcABthFvSfAgOi6qryctxVMIDDUw8dG0D7zpeExCWsXhwF-P4WpchCLXFIlHDuKcMh_hLrwllEBXvaiXLHc_jvWx-6auHYgOiftEQ-rGC4Fs99RRFGqKDFhtY8WjcecE6ZiBWZLAPIp8n9zp7Rms5-BnvkIm3erLJwRTY_b6OeYLX5zPxi9p7VH1qlkg_ZgVyjw-DwuQ4stTGcn-XvYMRKO5uIs',
    initials: 'MC',
    badgeText: 'Khách Thân Thiết',
    badgeType: 'repeat',
    roomTitle: 'Phòng 218 • Ocean King',
    roomSubtitle: 'Tầng 2 • Ban công hướng biển',
    floorGroup: 'floor-1-3',
    stayDates: '19/10 – 23/10',
    stayMeta: '4 đêm (Đêm 1/4)',
    usdFolio: '$1,780.00',
    vndFolio: '45,200,000 ₫',
    statusText: 'Đang lưu trú',
    statusVariant: 'checked-in',
    categories: ['all', 'in-house'],
  },
  {
    id: 'res-9485',
    resCode: '#RES-9485',
    guestName: 'Sophie Dupont',
    guestEmail: 'dupont.s@geneva-corp.ch',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeGyHLXaWT6c5ov2xIy5DD-VWNjJyylzX-wgJKX2huiCyWa7Vs0-nSZUEH80HBlRjrkWDuXtJREOfIw2IgkjIk9RiraS80tGP5N3gFfiQc3eM7ozGxf1us9S-hNDW-TbVS13_fPWrGLzuolvGbzTjC16pwQHYo8wFBefPuXqq94aIbAVRFwyIC-Pbgj-xWIqRV22KG9iXcTyYuTNYaCUrT454vX4UjB3m4vF7nmM0',
    initials: 'SD',
    badgeText: 'VIP Bạch Kim',
    badgeType: 'vip',
    roomTitle: 'Villa 12 • Biệt Thự Vườn',
    roomSubtitle: 'Tầng trệt • Bể bơi vô cực riêng',
    floorGroup: 'floor-1-3',
    stayDates: '20/10 – 25/10',
    stayMeta: '5 đêm • Đến lúc 14:00',
    usdFolio: '$5,650.00',
    vndFolio: '143,500,000 ₫',
    statusText: 'Dự kiến đến 14:00',
    statusVariant: 'eta',
    categories: ['all', 'confirmed', 'vip'],
  },
  {
    id: 'res-9490',
    resCode: '#RES-9490',
    guestName: "Liam O'Connor",
    guestEmail: 'loconnor@dublin-ventures.ie',
    initials: 'LO',
    roomTitle: 'Phòng 304 • Executive King',
    roomSubtitle: 'Tầng 3 • Tầm nhìn toàn cảnh',
    floorGroup: 'floor-1-3',
    stayDates: '20/10 – 22/10',
    stayMeta: '2 đêm • Đặt phòng trực tuyến',
    usdFolio: '$890.00',
    vndFolio: '22,600,000 ₫',
    statusText: 'Đã xác nhận',
    statusVariant: 'confirmed',
    categories: ['all', 'confirmed'],
  },
]

const PACE_BARS = [
  { day: 'T2', pct: 84, buffer: 16 },
  { day: 'T3', pct: 88, buffer: 12 },
  { day: 'T4', pct: 91, buffer: 9 },
  { day: 'T5', pct: 95, buffer: 5, bold: true },
  { day: 'T6', pct: 98, buffer: 2 },
  { day: 'T7', pct: 100, buffer: 0, peak: true },
  { day: 'CN', pct: 92, buffer: 8 },
] as const

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { message } = AntApp.useApp()
  const { mode } = useDataMode()

  const [floorFilter, setFloorFilter] = useState<FloorFilterId>('all')
  const [tableSearch, setTableSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<ReservationStatusFilter>('all')
  const [currency, setCurrency] = useState<'USD' | 'VND'>('USD')
  const [reservations, setReservations] =
    useState<ReservationRowItem[]>(INITIAL_RESERVATIONS)

  // Drawers for hotel, room type, and physical room management
  const [createHotelOpen, setCreateHotelOpen] = useState(false)
  const [createRoomTypeOpen, setCreateRoomTypeOpen] = useState(false)
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [roomReadinessMap, setRoomReadinessMap] = useState<
    Record<string, 'READY' | 'DIRTY'>
  >({})

  const citiesQuery = useCitiesQuery()
  const hotelsQuery = useManagementHotelsQuery({ page: 0, size: 12 })
  const hotels = hotelsQuery.data?.content ?? []
  const cities = citiesQuery.data ?? []

  const activeHotelId =
    hotels.some((h) => h.id === selectedHotelId)
      ? selectedHotelId
      : (hotels[0]?.id ?? '')

  const hotelDetailQuery = useManagementHotelDetailQuery(activeHotelId)
  const physicalRoomsQuery = usePhysicalRoomsByHotelQuery(activeHotelId)

  const activeHotel = hotelDetailQuery.data
  const roomTypes = activeHotel?.roomTypes ?? []
  const physicalRooms = physicalRoomsQuery.data ?? []

  const filteredReservations = useMemo(() => {
    const qTable = tableSearch.trim().toLowerCase()

    return reservations.filter((item) => {
      if (floorFilter !== 'all' && item.floorGroup !== floorFilter) {
        return false
      }
      if (
        statusFilter !== 'all' &&
        !item.categories.includes(statusFilter)
      ) {
        return false
      }
      const haystack =
        `${item.resCode} ${item.guestName} ${item.guestEmail} ${item.roomTitle} ${item.roomSubtitle} ${item.statusText}`.toLowerCase()
      if (qTable && !haystack.includes(qTable)) return false
      return true
    })
  }, [reservations, floorFilter, statusFilter, tableSearch])

  function handleUpdateReservationStatus(
    rowId: string,
    nextStatus: 'checked-in' | 'confirmed' | 'due-out' | 'cancelled',
  ) {
    const metaMap = {
      'checked-in': {
        text: 'Đang lưu trú',
        variant: 'checked-in' as const,
        cat: 'in-house' as const,
      },
      confirmed: {
        text: 'Đã xác nhận',
        variant: 'confirmed' as const,
        cat: 'confirmed' as const,
      },
      'due-out': {
        text: 'Chờ trả phòng',
        variant: 'eta' as const,
        cat: 'in-house' as const,
      },
      cancelled: {
        text: 'Đã hủy',
        variant: 'confirmed' as const,
        cat: 'confirmed' as const,
      },
    }
    const target = metaMap[nextStatus]
    setReservations((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        return {
          ...row,
          statusText: target.text,
          statusVariant: target.variant,
          categories: Array.from(new Set([...row.categories, target.cat])),
        }
      }),
    )
    void message.success(`Đã cập nhật trạng thái đặt phòng thành: ${target.text}`)
  }

  return (
    <div className="atelier-stack">
            {/* Welcome Greeting & Operational Command Bar */}
            <section
              className="atelier-command-card"
              aria-labelledby="atelier-greeting-heading"
            >
              <div className="atelier-command-card__info">
                <div className="atelier-badges-row">
                  <span className="atelier-season-pill">
                    Mùa Thu Cao Điểm • Công Suất Cao
                  </span>
                  <span className="atelier-sync-pill">
                    <span
                      className="atelier-dot-tertiary"
                      style={{ width: 6, height: 6 }}
                      aria-hidden="true"
                    />
                    Đồng bộ trực tiếp • 09:41 SA
                  </span>
                </div>
                <h1
                  id="atelier-greeting-heading"
                  className="atelier-headline-xl"
                >
                  Xin chào, Giám đốc Quản lý
                </h1>
                <p className="atelier-command-card__desc">
                  Tổng quan vận hành cơ sở lưu trú — công suất buồng phòng,
                  khách nhận phòng thực tế, khách VIP và tiến độ doanh thu trong ngày.
                </p>
              </div>

              {/* Quick Operations Action Buttons */}
              <div className="atelier-quick-actions">
                <button
                  type="button"
                  className="atelier-action-btn"
                  onClick={() => {
                    document
                      .getElementById('reservations-table-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                    setStatusFilter('confirmed')
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    key
                  </span>
                  <span>Check-in Nhanh</span>
                </button>
                <button
                  type="button"
                  className="atelier-action-btn"
                  onClick={() => setCreateRoomOpen(true)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    meeting_room
                  </span>
                  <span>Thêm buồng phòng</span>
                </button>
                <button
                  type="button"
                  className="atelier-action-btn"
                  onClick={() => setCreateRoomTypeOpen(true)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    history_edu
                  </span>
                  <span>Thêm hạng phòng</span>
                </button>
                <button
                  type="button"
                  className="atelier-action-btn atelier-action-btn--primary"
                  onClick={() => setCreateHotelOpen(true)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  >
                    add
                  </span>
                  <span>Thêm khách sạn mới</span>
                </button>
              </div>
            </section>

            {/* Primary Metric & Analytics Grid in 3 Clean Balanced Columns */}
            <div className="atelier-bento-grid">
              {/* Left Column: Master Revenue Card & Digital Keys (4 Cols) */}
              <div className="atelier-col-4 atelier-col-stack">
                {/* Total Daily Revenue Card */}
                <div className="atelier-card atelier-card--flex-1">
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            color: 'var(--atelier-primary)',
                            fontSize: 20,
                          }}
                          aria-hidden="true"
                        >
                          account_balance_wallet
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--atelier-on-surface-variant)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                          }}
                        >
                          Tổng Doanh Thu Trong Ngày
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrency((prev) =>
                            prev === 'USD' ? 'VND' : 'USD',
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor: 'var(--atelier-surface-container)',
                          padding: '4px 10px',
                          borderRadius: 9999,
                          border: 0,
                          color: 'var(--atelier-on-surface)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <span>{currency === 'USD' ? 'USD ($)' : 'VND (₫)'}</span>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </button>
                    </div>

                    <div style={{ margin: '16px 0' }}>
                      <div className="atelier-headline-xl">
                        {currency === 'USD'
                          ? '$48,290.00'
                          : '1,226,500,000 ₫'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            backgroundColor: 'var(--atelier-tertiary-fixed)',
                            color: 'var(--atelier-on-tertiary-fixed)',
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14 }}
                            aria-hidden="true"
                          >
                            trending_up
                          </span>{' '}
                          +12.4%
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          {currency === 'USD'
                            ? 'so với hôm qua ($42,950)'
                            : 'so với hôm qua (1,091,000,000 ₫)'}
                        </span>
                      </div>
                    </div>

                    {/* Folio Transfer and Post Charges Buttons */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void navigate(
                            activeHotelId
                              ? `/management/contracts?hotelId=${activeHotelId}`
                              : '/management/contracts',
                          )
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 9999,
                          border: 0,
                          backgroundColor: 'var(--atelier-inverse-surface)',
                          color: 'var(--atelier-inverse-on-surface)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                          aria-hidden="true"
                        >
                          sync_alt
                        </span>
                        <span>Chuyển Folio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void navigate(
                            activeHotelId
                              ? `/management/rates?hotelId=${activeHotelId}`
                              : '/management/rates',
                          )
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 9999,
                          border: 0,
                          backgroundColor: 'var(--atelier-surface-container)',
                          color: 'var(--atelier-on-surface)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                          aria-hidden="true"
                        >
                          receipt_long
                        </span>
                        <span>Ghi Nhận Phí</span>
                      </button>
                    </div>
                  </div>

                  {/* Departmental Breakdown Strip */}
                  <div
                    style={{
                      paddingTop: 8,
                      borderTop: '1px solid var(--atelier-surface-container)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--atelier-on-surface-variant)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Phân Bổ Theo Bộ Phận
                    </span>
                    <div className="atelier-dept-grid">
                      <div className="atelier-dept-item">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--atelier-on-surface-variant)',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14,
                              color: 'var(--atelier-primary)',
                            }}
                            aria-hidden="true"
                          >
                            bed
                          </span>
                          <span>Tiền phòng</span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: 2,
                          }}
                        >
                          {currency === 'USD' ? '$38.5k' : '978M ₫'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 10,
                            color: 'var(--atelier-tertiary)',
                            fontWeight: 600,
                          }}
                        >
                          +9.2%
                        </span>
                      </div>

                      <div className="atelier-dept-item">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--atelier-on-surface-variant)',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14,
                              color: 'var(--atelier-primary)',
                            }}
                            aria-hidden="true"
                          >
                            restaurant
                          </span>
                          <span>F&amp;B</span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: 2,
                          }}
                        >
                          {currency === 'USD' ? '$6.2k' : '158M ₫'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 10,
                            color: 'var(--atelier-tertiary)',
                            fontWeight: 600,
                          }}
                        >
                          +14.1%
                        </span>
                      </div>

                      <div className="atelier-dept-item">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--atelier-on-surface-variant)',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14,
                              color: 'var(--atelier-primary)',
                            }}
                            aria-hidden="true"
                          >
                            spa
                          </span>
                          <span>Spa &amp; Wellness</span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: 2,
                          }}
                        >
                          {currency === 'USD' ? '$3.5k' : '90.5M ₫'}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 10,
                            color: 'var(--atelier-tertiary)',
                            fontWeight: 600,
                          }}
                        >
                          +5.0%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Key Allocations Card */}
                <div
                  className="atelier-card atelier-card--compact"
                  style={{ gap: 12 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 18 }}
                        aria-hidden="true"
                      >
                        credit_card
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>
                        Phân Bổ Thẻ Phòng Điện Tử
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateRoomOpen(true)}
                      style={{
                        border: 0,
                        background: 'transparent',
                        fontSize: 11,
                        color: 'var(--atelier-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Cấp Thẻ Loạt
                    </button>
                  </div>

                  <div className="atelier-key-grid">
                    <div className="atelier-key-card atelier-key-card--dark">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--atelier-font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            opacity: 0.75,
                          }}
                        >
                          Thẻ Quản Lý Chung
                        </span>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                            color: 'var(--atelier-tertiary-fixed)',
                          }}
                          aria-hidden="true"
                        >
                          lock_open
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          DUTY • 8812
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.65 }}>
                          Hết hạn 06:00 AM
                        </div>
                      </div>
                    </div>

                    <div className="atelier-key-card atelier-key-card--terracotta">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--atelier-font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            opacity: 0.9,
                          }}
                        >
                          Phòng VIP #402
                        </span>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                          aria-hidden="true"
                        >
                          contactless
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          E. Vance • Di động
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.85 }}>
                          Hiệu lực 4 đêm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: 2x2 Grid of Performance KPI Cards (4 Cols) */}
              <div className="atelier-col-4 atelier-kpi-2x2">
                {/* Card 1: Terracotta Occupancy Rate Tile */}
                <div className="atelier-kpi-tile atelier-kpi-tile--primary">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--atelier-primary-fixed)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Công Suất Phòng
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9999,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                        aria-hidden="true"
                      >
                        bed
                      </span>
                    </div>
                  </div>

                  <div style={{ margin: 'auto 0', padding: '4px 0' }}>
                    <div
                      style={{
                        fontSize: 34,
                        lineHeight: 1.15,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      92.4%
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4,
                        fontSize: 11,
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontWeight: 500,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 13 }}
                        aria-hidden="true"
                      >
                        arrow_upward
                      </span>
                      <span>+3.8% tuần này</span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--atelier-primary-fixed)',
                    }}
                  >
                    148 / 160 phòng có khách
                  </div>
                </div>

                {/* Card 2: Daily Housekeeping Target Tile */}
                <div className="atelier-kpi-tile">
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 9999,
                            backgroundColor: 'var(--atelier-surface-container)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--atelier-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 15 }}
                            aria-hidden="true"
                          >
                            clean_hands
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Buồng Phòng
                        </span>
                      </div>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 9999,
                          backgroundColor: 'var(--atelier-surface-container)',
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        112/126
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--atelier-surface-container)',
                          height: 6,
                          borderRadius: 9999,
                          overflow: 'hidden',
                          display: 'flex',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--atelier-tertiary)',
                            height: '100%',
                            borderRadius: 9999,
                            width: '88.8%',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          paddingTop: 2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--atelier-tertiary)',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span
                            className="atelier-dot-tertiary"
                            style={{ width: 6, height: 6 }}
                          />{' '}
                          88.8% Sẵn sàng
                        </span>
                        <span
                          style={{
                            color: 'var(--atelier-primary)',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span className="atelier-dot-primary" /> 14 Chưa dọn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 4,
                      paddingTop: 8,
                      borderTop: '1px solid var(--atelier-surface-container)',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: 'var(--atelier-surface-low)',
                        padding: '4px 2px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: 'var(--atelier-on-surface-variant)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Đã dọn
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        112
                      </span>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--atelier-surface-low)',
                        padding: '4px 2px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: 'var(--atelier-on-surface-variant)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Đang dọn
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        10
                      </span>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'var(--atelier-surface-low)',
                        padding: '4px 2px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          color: 'var(--atelier-on-surface-variant)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Chờ dọn
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--atelier-primary)',
                        }}
                      >
                        4
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: RevPAR Tile */}
                <div className="atelier-kpi-tile">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--atelier-on-surface-variant)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      RevPAR
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9999,
                        backgroundColor: 'var(--atelier-surface-container)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                        aria-hidden="true"
                      >
                        finance
                      </span>
                    </div>
                  </div>

                  <div style={{ margin: 'auto 0', padding: '4px 0' }}>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {currency === 'USD' ? '$301.80' : '7,650,000 ₫'}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4,
                        fontSize: 11,
                        color: 'var(--atelier-tertiary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14 }}
                        aria-hidden="true"
                      >
                        trending_up
                      </span>
                      <span>+8.5% so với tháng trước</span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--atelier-on-surface-variant)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Chỉ số: 114 so với đối thủ
                  </div>
                </div>

                {/* Card 4: ADR Average Tile */}
                <div className="atelier-kpi-tile">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--atelier-on-surface-variant)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ADR (Giá Phòng TB)
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9999,
                        backgroundColor: 'var(--atelier-surface-container)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                        aria-hidden="true"
                      >
                        sell
                      </span>
                    </div>
                  </div>

                  <div style={{ margin: 'auto 0', padding: '4px 0' }}>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {currency === 'USD' ? '$326.50' : '8,280,000 ₫'}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4,
                        fontSize: 11,
                        color: 'var(--atelier-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14 }}
                        aria-hidden="true"
                      >
                        north_east
                      </span>
                      <span>+$24 so với mức chuẩn</span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--atelier-on-surface-variant)',
                    }}
                  >
                    Hạng cao cấp đang đạt đỉnh
                  </div>
                </div>
              </div>

              {/* Right Column: Occupancy Pace & Bar Projection Chart (4 Cols) */}
              <div className="atelier-col-4 atelier-card">
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        Dự Báo Công Suất Tuần
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--atelier-on-surface-variant)',
                        }}
                      >
                        Dự báo nhu cầu đặt phòng (Thứ 2 - CN)
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 11,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: 'var(--atelier-primary)',
                            display: 'inline-block',
                          }}
                        />{' '}
                        Đã đặt
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--atelier-on-surface-variant)',
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: 'var(--atelier-surface-high)',
                            display: 'inline-block',
                          }}
                        />{' '}
                        Còn trống
                      </span>
                    </div>
                  </div>

                  {/* Demand Projection Bar Chart */}
                  <div className="atelier-pace-bars">
                    {PACE_BARS.map((bar) => {
                      const isPeak = 'peak' in bar && bar.peak
                      const isBold = 'bold' in bar && bar.bold
                      const labelColor = isPeak
                        ? 'var(--atelier-primary)'
                        : isBold
                          ? 'var(--atelier-on-surface)'
                          : 'var(--atelier-on-surface-variant)'
                      return (
                        <div key={bar.day} className="atelier-pace-bar-col">
                          <span
                            style={{
                              fontFamily: 'var(--atelier-font-mono)',
                              fontSize: 10,
                              fontWeight: isPeak || isBold ? 700 : 500,
                              color: labelColor,
                            }}
                          >
                            {bar.pct}%
                          </span>
                          <div className="atelier-pace-bar-track">
                            {bar.buffer > 0 && (
                              <div
                                className="atelier-pace-bar-buffer"
                                style={{ height: `${bar.buffer}%` }}
                              />
                            )}
                            <div
                              className="atelier-pace-bar-fill"
                              style={{ height: `${bar.pct}%` }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: isPeak || isBold ? 700 : 600,
                              color: labelColor,
                            }}
                          >
                            {bar.day}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Room Category Pace Matrix */}
                <div
                  style={{
                    paddingTop: 16,
                    borderTop: '1px solid var(--atelier-surface-container)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Hạng Penthouse Hoàng Gia</span>
                    <span
                      style={{
                        fontFamily: 'var(--atelier-font-mono)',
                        fontSize: 13,
                        color: 'var(--atelier-primary)',
                        fontWeight: 700,
                      }}
                    >
                      100% Đã bán hết
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Deluxe Hướng Biển</span>
                    <span
                      style={{
                        fontFamily: 'var(--atelier-font-mono)',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      96% (Còn 2 phòng)
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Biệt Thự Vườn Cảnh Quan</span>
                    <span
                      style={{
                        fontFamily: 'var(--atelier-font-mono)',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      88% (Còn 4 phòng)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Guest Bookings & Live Folio Management Table Section */}
            <section
              id="reservations-table-section"
              className="atelier-card"
              style={{ gap: 16 }}
              aria-labelledby="recent-reservations-title"
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2
                    id="recent-reservations-title"
                    style={{ fontSize: 20, lineHeight: '28px', fontWeight: 700 }}
                  >
                    Danh Sách Khách Lưu Trú &amp; Đặt Phòng Gần Đây
                  </h2>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 9999,
                      backgroundColor: 'var(--atelier-surface-container)',
                      color: 'var(--atelier-on-surface-variant)',
                      fontFamily: 'var(--atelier-font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    148 Đang hoạt động
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Interactive Search Input */}
                  <label
                    className="atelier-search-pill"
                    style={{ width: 240, padding: '6px 12px' }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 16,
                        color: 'var(--atelier-secondary)',
                        marginRight: 6,
                      }}
                      aria-hidden="true"
                    >
                      search
                    </span>
                    <input
                      id="guestSearchInput"
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      aria-label="Lọc đặt phòng theo tên khách hoặc số phòng"
                      placeholder="Lọc theo tên, số phòng..."
                    />
                  </label>

                  {/* Floor Filter Tabs */}
                  <div
                    className="atelier-pill-group"
                    role="group"
                    aria-label="Lọc đặt phòng theo tầng"
                  >
                    {(
                      [
                        { id: 'all', label: 'Tất cả tầng' },
                        { id: 'floor-1-3', label: 'Tầng 1 - 3' },
                        { id: 'penthouse', label: 'Penthouse' },
                      ] as const
                    ).map((fl) => (
                      <button
                        key={fl.id}
                        type="button"
                        className={`atelier-pill-tab ${
                          floorFilter === fl.id ? 'is-active-dark' : ''
                        }`}
                        onClick={() => setFloorFilter(fl.id)}
                      >
                        {fl.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter Tabs */}
                  <div
                    className="atelier-pill-group"
                    role="group"
                    aria-label="Lọc đặt phòng theo trạng thái"
                  >
                    {(
                      [
                        { id: 'all', label: 'Tất cả' },
                        { id: 'in-house', label: 'Đang lưu trú' },
                        { id: 'confirmed', label: 'Đến hôm nay' },
                        { id: 'vip', label: 'Khách VIP' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`atelier-pill-tab ${
                          statusFilter === tab.id ? 'is-active-dark' : ''
                        }`}
                        onClick={() => setStatusFilter(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="atelier-icon-circle-btn"
                    aria-label="Xuất danh sách khách (CSV)"
                    title="Xuất danh sách khách (CSV)"
                    onClick={() =>
                      void message.success('Đã xuất danh sách lưu trú (CSV).')
                    }
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    >
                      download
                    </span>
                  </button>
                </div>
              </div>

              {/* Table Data View */}
              <div className="atelier-table-wrap">
                <table className="atelier-table" id="reservationsTable">
                  <thead>
                    <tr>
                      <th>Mã Đặt Phòng</th>
                      <th>Thông Tin Khách Lưu Trú</th>
                      <th>Hạng Phòng &amp; Số Buồng</th>
                      <th>Thời Gian Lưu Trú</th>
                      <th style={{ textAlign: 'right' }}>Tổng Tiền Folio</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((row) => (
                      <tr key={row.id}>
                        <td
                          style={{
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              row.badgeType === 'vip'
                                ? 'var(--atelier-primary)'
                                : 'var(--atelier-on-surface-variant)',
                          }}
                        >
                          {row.resCode}
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                            }}
                          >
                            {row.avatarUrl ? (
                              <img
                                src={row.avatarUrl}
                                alt={row.guestName}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 9999,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 9999,
                                  backgroundColor:
                                    'var(--atelier-secondary-container)',
                                  color:
                                    'var(--atelier-on-secondary-container)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                {row.initials}
                              </div>
                            )}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{ fontSize: 14, fontWeight: 700 }}
                                >
                                  {row.guestName}
                                </span>
                                {row.badgeText && (
                                  <span
                                    className={
                                      row.badgeType === 'vip'
                                        ? 'atelier-vip-tag'
                                        : 'atelier-repeat-tag'
                                    }
                                  >
                                    {row.badgeText}
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: 12,
                                  color: 'var(--atelier-on-surface-variant)',
                                }}
                              >
                                {row.guestEmail}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              {row.roomTitle}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: 'var(--atelier-on-surface-variant)',
                              }}
                            >
                              {row.roomSubtitle}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              {row.stayDates}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: 'var(--atelier-on-surface-variant)',
                              }}
                            >
                              {row.stayMeta}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: 'var(--atelier-font-mono)',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {currency === 'USD' ? row.usdFolio : row.vndFolio}
                        </td>
                        <td>
                          <span
                            className={`atelier-status-badge atelier-status-badge--${row.statusVariant}`}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 9999,
                                backgroundColor:
                                  row.statusVariant === 'checked-in'
                                    ? 'var(--atelier-tertiary)'
                                    : row.statusVariant === 'eta'
                                      ? 'var(--atelier-primary)'
                                      : 'var(--atelier-secondary)',
                              }}
                            />
                            {row.statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Dropdown
                            trigger={['click']}
                            placement="bottomRight"
                            menu={{
                              items: [
                                {
                                  key: 'group-title',
                                  type: 'group',
                                  label: `Cập nhật trạng thái • ${row.resCode}`,
                                },
                                {
                                  key: 'checked-in',
                                  label: 'Đang lưu trú (In-House)',
                                  icon: (
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: 16,
                                        color: 'var(--atelier-tertiary)',
                                      }}
                                      aria-hidden="true"
                                    >
                                      check_circle
                                    </span>
                                  ),
                                },
                                {
                                  key: 'confirmed',
                                  label: 'Xác nhận đặt phòng (Confirmed)',
                                  icon: (
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: 16,
                                        color: 'var(--atelier-primary)',
                                      }}
                                      aria-hidden="true"
                                    >
                                      event_available
                                    </span>
                                  ),
                                },
                                {
                                  key: 'due-out',
                                  label: 'Chờ làm thủ tục trả phòng (Due Out)',
                                  icon: (
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: 16,
                                        color: 'var(--atelier-secondary)',
                                      }}
                                      aria-hidden="true"
                                    >
                                      schedule
                                    </span>
                                  ),
                                },
                                {
                                  type: 'divider',
                                },
                                {
                                  key: 'cancelled',
                                  label: 'Hủy phòng lưu trú (Cancel)',
                                  danger: true,
                                  icon: (
                                    <span
                                      className="material-symbols-outlined"
                                      style={{ fontSize: 16 }}
                                      aria-hidden="true"
                                    >
                                      cancel
                                    </span>
                                  ),
                                },
                              ],
                              onClick: ({ key }) => {
                                handleUpdateReservationStatus(
                                  row.id,
                                  key as
                                    | 'checked-in'
                                    | 'confirmed'
                                    | 'due-out'
                                    | 'cancelled',
                                )
                              },
                            }}
                          >
                            <button
                              type="button"
                              className="atelier-icon-circle-btn"
                              style={{
                                marginLeft: 'auto',
                                width: 32,
                                height: 32,
                              }}
                              aria-label={`Tùy chọn trạng thái cho ${row.guestName}`}
                              title="Cập nhật trạng thái đặt phòng"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18 }}
                                aria-hidden="true"
                              >
                                more_vert
                              </span>
                            </button>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination & Footer Status */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  paddingTop: 8,
                  color: 'var(--atelier-on-surface-variant)',
                  fontSize: 12,
                }}
              >
                <span>
                  Hiển thị {filteredReservations.length} trên 148 hồ sơ khách lưu trú • Kết nối trực tiếp hệ thống PMS
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="atelier-action-btn"
                    style={{ padding: '4px 12px', borderRadius: 8 }}
                  >
                    Trước
                  </button>
                  <span
                    style={{
                      fontFamily: 'var(--atelier-font-mono)',
                      fontSize: 13,
                      padding: '0 8px',
                    }}
                  >
                    Trang 1 / 37
                  </span>
                  <button
                    type="button"
                    className="atelier-action-btn"
                    style={{ padding: '4px 12px', borderRadius: 8 }}
                  >
                    Sau
                  </button>
                </div>
              </div>
            </section>

            {/* Property Catalog: Hotels, Room Types & Physical Rooms */}
            <section
              id="backend-catalog-section"
              className="atelier-card"
              style={{ gap: 20 }}
              aria-labelledby="backend-catalog-title"
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <h2
                      id="backend-catalog-title"
                      style={{ fontSize: 20, fontWeight: 700 }}
                    >
                      Danh Mục Cơ Sở Lưu Trú, Hạng Phòng &amp; Buồng Phòng
                    </h2>
                    <Tag color={mode === 'mock' ? 'gold' : 'green'}>
                      {mode === 'mock' ? 'Dữ liệu mẫu' : 'Hệ thống thực'}
                    </Tag>
                  </div>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 13,
                      color: 'var(--atelier-on-surface-variant)',
                    }}
                  >
                    Quản lý danh mục cơ sở lưu trú, phân bổ hạng phòng và tình trạng buồng phòng sẵn sàng phục vụ.
                  </p>
                </div>

                <Space wrap>
                  <Select
                    aria-label="Chọn khách sạn quản lý"
                    value={activeHotelId || undefined}
                    onChange={(val) => setSelectedHotelId(val)}
                    style={{ minWidth: 280 }}
                    placeholder="Chọn khách sạn..."
                    options={hotels.map((h) => ({
                      label: `${h.name} (${h.cityName ?? 'VN'})`,
                      value: h.id,
                    }))}
                  />
                  <Button onClick={() => setCreateRoomTypeOpen(true)}>
                    + Thêm Hạng Phòng
                  </Button>
                  <Button onClick={() => setCreateRoomOpen(true)}>
                    + Thêm Buồng Phòng
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setCreateHotelOpen(true)}
                  >
                    + Tạo Khách Sạn Mới
                  </Button>
                  <Button
                    icon={<ArrowRightOutlined aria-hidden="true" />}
                    onClick={() => void navigate('/management/hotels')}
                  >
                    Quản Lý Cơ Sở Đầy Đủ
                  </Button>
                </Space>
              </div>

              {hotelsQuery.isPending ? (
                <PageLoading />
              ) : hotelsQuery.isError ? (
                <ErrorState
                  error={hotelsQuery.error}
                  retrying={hotelsQuery.isFetching}
                  onRetry={() => void hotelsQuery.refetch()}
                />
              ) : hotels.length === 0 ? (
                <EmptyState
                  title="Chưa có khách sạn nào trong danh mục quản lý"
                  description="Sử dụng nút Tạo Khách Sạn để khởi tạo cơ sở lưu trú đầu tiên."
                  action={
                    <Button
                      type="primary"
                      onClick={() => setCreateHotelOpen(true)}
                    >
                      Tạo khách sạn mới
                    </Button>
                  }
                />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 16,
                  }}
                >
                  {/* Active Hotel Summary & Room Types */}
                  <div
                    style={{
                      backgroundColor: 'var(--atelier-surface-low)',
                      padding: 18,
                      borderRadius: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 15 }}>
                        {activeHotel?.name ?? hotels[0]?.name}
                      </span>
                      {activeHotel && (
                        <HotelStatusBadge status={activeHotel.status} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--atelier-on-surface-variant)',
                      }}
                    >
                      {activeHotel?.address ?? hotels[0]?.address} • Nhận{' '}
                      {(
                        activeHotel?.checkInTime ??
                        hotels[0]?.checkInTime ??
                        '14:00'
                      ).slice(0, 5)}{' '}
                      / Trả{' '}
                      {(
                        activeHotel?.checkOutTime ??
                        hotels[0]?.checkOutTime ??
                        '12:00'
                      ).slice(0, 5)}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--atelier-on-surface-variant)',
                        }}
                      >
                        Hạng phòng ({roomTypes.length})
                      </span>
                      {roomTypes.map((rt) => (
                        <div
                          key={rt.id}
                          style={{
                            backgroundColor: 'var(--atelier-surface-lowest)',
                            padding: '10px 12px',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>
                              {rt.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--atelier-on-surface-variant)',
                              }}
                            >
                              Tối đa {rt.maxAdults} người lớn · {rt.maxChildren}{' '}
                              trẻ em
                            </div>
                          </div>
                          <Tag color={rt.isActive ? 'green' : 'default'}>
                            {rt.isActive ? 'ĐANG KINH DOANH' : 'TẠM NGỪNG'}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Physical Rooms Readiness Panel */}
                  <div
                    style={{
                      backgroundColor: 'var(--atelier-surface-low)',
                      padding: 18,
                      borderRadius: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 15 }}>
                        Buồng Phòng Vật Lý &amp; Tình Trạng Bàn Giao
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--atelier-font-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {physicalRooms.length} Buồng phòng
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {physicalRooms.map((rm) => {
                        const readiness =
                          roomReadinessMap[rm.id] ?? rm.readiness
                        const isReady = readiness === 'READY'
                        return (
                          <div
                            key={rm.id}
                            style={{
                              backgroundColor: 'var(--atelier-surface-lowest)',
                              padding: '10px 12px',
                              borderRadius: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontFamily: 'var(--atelier-font-mono)',
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                Phòng #{rm.roomNumber}{' '}
                                <span
                                  style={{
                                    fontWeight: 500,
                                    color: 'var(--atelier-on-surface-variant)',
                                  }}
                                >
                                  ({rm.floor ?? 'Tầng trệt'})
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: 'var(--atelier-on-surface-variant)',
                                }}
                              >
                                Đưa vào vận hành:{' '}
                                {rm.operationalFrom.slice(0, 10)}
                              </div>
                            </div>

                            <Space>
                              <span
                                className={`atelier-status-badge ${
                                  isReady
                                    ? 'atelier-status-badge--checked-in'
                                    : 'atelier-status-badge--eta'
                                }`}
                              >
                                {isReady ? 'SẴN SÀNG ĐÓN KHÁCH' : 'CHƯA DỌN DẸP'}
                              </span>
                              <Button
                                size="small"
                                onClick={() =>
                                  setRoomReadinessMap((prev) => ({
                                    ...prev,
                                    [rm.id]: isReady ? 'DIRTY' : 'READY',
                                  }))
                                }
                              >
                                {isReady ? 'Chuyển CHƯA DỌN' : 'Chuyển SẴN SÀNG'}
                              </Button>
                            </Space>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>

      {/* Backend-Connected Drawers */}
      <CreateAdminHotelDrawer
        open={createHotelOpen}
        onClose={() => setCreateHotelOpen(false)}
        cities={cities}
        onCreated={(created) => {
          setSelectedHotelId(created.id)
        }}
      />

      {activeHotelId && (
        <>
          <CreateRoomTypeDrawer
            open={createRoomTypeOpen}
            onClose={() => setCreateRoomTypeOpen(false)}
            hotelId={activeHotelId}
            hotelName={activeHotel?.name}
          />
          <CreatePhysicalRoomDrawer
            open={createRoomOpen}
            onClose={() => setCreateRoomOpen(false)}
            hotelId={activeHotelId}
            hotelName={activeHotel?.name}
            roomTypes={roomTypes}
          />
        </>
      )}
    </div>
  )
}
