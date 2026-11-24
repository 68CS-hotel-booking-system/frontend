import { useState, type CSSProperties } from 'react'
import type { z } from 'zod'
import type { dashboardSchema } from '../api/dashboard-api'

type FinanceDashboardData = z.infer<typeof dashboardSchema>

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (part: number, total: number) => {
  if (total <= 0) return '0%'
  const pct = (part / total) * 100
  return `${pct >= 10 || pct === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`
}

export function RevenueCharts({ data, isAdmin }: { data: FinanceDashboardData; isAdmin: boolean }) {
  const [activeSlice, setActiveSlice] = useState<'platform' | 'owner' | null>(null)

  const splitTotal = data.platformAmount + data.ownerAmount
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const platformRatio = splitTotal > 0 ? data.platformAmount / splitTotal : 0
  const ownerRatio = splitTotal > 0 ? data.ownerAmount / splitTotal : 0
  const platformDash = platformRatio * circumference
  const ownerDash = ownerRatio * circumference

  const defaultSlice: 'platform' | 'owner' = isAdmin ? 'platform' : 'owner'
  const focusedSlice = activeSlice ?? defaultSlice
  const focusedRatio = focusedSlice === 'platform' ? platformRatio : ownerRatio
  const focusedLabel =
    focusedSlice === 'platform'
      ? isAdmin
        ? 'Nền tảng'
        : 'Hoa hồng'
      : isAdmin
        ? 'Owner'
        : 'Bạn hưởng'

  const maxFlow = Math.max(data.bookedAmount, data.collectedAmount, data.completedAmount, 1)
  const flowBars = [
    {
      key: 'booked',
      label: 'Tổng giá trị đặt phòng',
      value: data.bookedAmount,
      color: '#8bc4b5',
      delay: '0ms',
    },
    {
      key: 'collected',
      label: 'Tiền khách đã thanh toán',
      value: data.collectedAmount,
      color: '#4e9b86',
      delay: '80ms',
    },
    {
      key: 'completed',
      label: 'Doanh thu lưu trú hoàn thành',
      value: data.completedAmount,
      color: '#0f7a5f',
      delay: '160ms',
    },
    {
      key: 'share',
      label: isAdmin ? 'Hoa hồng nền tảng' : 'Khoản bạn được hưởng',
      value: isAdmin ? data.platformAmount : data.ownerAmount,
      color: '#0b5f53',
      delay: '240ms',
    },
  ]

  const topContracts = [...data.contracts]
    .sort((a, b) => b.completedAmount - a.completedAmount)
    .slice(0, 6)
  const maxContractTotal = Math.max(...topContracts.map((c) => c.platformAmount + c.ownerAmount), 1)

  const openHotelsCount = data.hotels.filter((h) => h.acceptingBookings).length
  const pausedHotelsCount = data.hotels.length - openHotelsCount
  const totalHotels = data.hotels.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Donut Chart: Revenue Split */}
        <div
          className="lg:col-span-5 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 flex flex-col justify-between gap-4 dash-enter"
          style={{ '--dash-delay': '60ms' } as CSSProperties}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#12211d] m-0">Tỷ trọng phân chia doanh thu</h3>
              <p className="text-xs text-[#5f736e] mt-0.5 mb-0">
                Tổng giá trị đã chốt hoa hồng: <span className="font-semibold text-[#12211d] tabular-nums">{money(splitTotal)}</span>
              </p>
            </div>
          </div>

          {splitTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              <svg viewBox="0 0 160 160" className="w-36 h-36" role="img" aria-label="Chưa có dữ liệu phân chia doanh thu">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#e6efec" strokeWidth="18" />
                <text x="80" y="84" textAnchor="middle" className="fill-[#5f736e] text-xs font-medium">
                  0%
                </text>
              </svg>
              <span className="text-xs text-[#5f736e]">Chưa có dữ liệu phân chia</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90" role="img" aria-label="Biểu đồ tỷ trọng phân chia doanh thu">
                  <circle cx="80" cy="80" r={radius} fill="none" stroke="#e6efec" strokeWidth="18" />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#0b5f53"
                    strokeWidth={activeSlice === 'platform' ? 21 : 18}
                    strokeDasharray={`${platformDash} ${circumference}`}
                    strokeDashoffset={0}
                    opacity={activeSlice && activeSlice !== 'platform' ? 0.45 : 1}
                    className="chart-donut-arc cursor-pointer"
                    onMouseEnter={() => setActiveSlice('platform')}
                    onMouseLeave={() => setActiveSlice(null)}
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="#5ab099"
                    strokeWidth={activeSlice === 'owner' ? 21 : 18}
                    strokeDasharray={`${ownerDash} ${circumference}`}
                    strokeDashoffset={-platformDash}
                    opacity={activeSlice && activeSlice !== 'owner' ? 0.45 : 1}
                    className="chart-donut-arc cursor-pointer"
                    onMouseEnter={() => setActiveSlice('owner')}
                    onMouseLeave={() => setActiveSlice(null)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
                  <span className="text-xl font-bold text-[#12211d] tabular-nums leading-none">
                    {(focusedRatio * 100).toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-medium text-[#5f736e] mt-1">{focusedLabel}</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2.5 min-w-0">
                <button
                  type="button"
                  onMouseEnter={() => setActiveSlice('platform')}
                  onMouseLeave={() => setActiveSlice(null)}
                  onFocus={() => setActiveSlice('platform')}
                  onBlur={() => setActiveSlice(null)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors cursor-pointer ${
                    activeSlice === 'platform'
                      ? 'border-[#0b5f53] bg-[#eef8f5]'
                      : 'border-[#dce7e3] bg-white hover:border-[#bfd3cd]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 font-medium text-[#344a44]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0b5f53] shrink-0" />
                      <span>{isAdmin ? 'Doanh thu nền tảng' : 'Hoa hồng nền tảng'}</span>
                    </span>
                    <span className="font-semibold text-[#0b5f53] tabular-nums">
                      {formatPercent(data.platformAmount, splitTotal)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#12211d] tabular-nums mt-1">
                    {money(data.platformAmount)}
                  </div>
                </button>

                <button
                  type="button"
                  onMouseEnter={() => setActiveSlice('owner')}
                  onMouseLeave={() => setActiveSlice(null)}
                  onFocus={() => setActiveSlice('owner')}
                  onBlur={() => setActiveSlice(null)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors cursor-pointer ${
                    activeSlice === 'owner'
                      ? 'border-[#0b5f53] bg-[#eef8f5]'
                      : 'border-[#dce7e3] bg-white hover:border-[#bfd3cd]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-2 font-medium text-[#344a44]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5ab099] shrink-0" />
                      <span>{isAdmin ? 'Khoản owner hưởng' : 'Doanh thu của bạn'}</span>
                    </span>
                    <span className="font-semibold text-[#0f7a5f] tabular-nums">
                      {formatPercent(data.ownerAmount, splitTotal)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#12211d] tabular-nums mt-1">
                    {money(data.ownerAmount)}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Comparison Bar Chart: Cashflow & Booking Scale */}
        <div
          className="lg:col-span-7 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 flex flex-col justify-between gap-4 dash-enter"
          style={{ '--dash-delay': '120ms' } as CSSProperties}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#12211d] m-0">Dòng tiền &amp; quy mô đặt phòng</h3>
              <p className="text-xs text-[#5f736e] mt-0.5 mb-0">So sánh giá trị đặt phòng, thực thu và doanh thu hoàn thành</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef8f5] text-[#0b5f53] border border-[#d6ebe5] tabular-nums">
              {data.bookingCount} đơn đặt phòng
            </span>
          </div>

          <div className="space-y-3.5" role="list" aria-label="Biểu đồ dòng tiền và quy mô đặt phòng">
            {flowBars.map((bar) => {
              const widthPct = data.bookedAmount === 0 && data.collectedAmount === 0 && data.completedAmount === 0
                ? 0
                : Math.max((bar.value / maxFlow) * 100, bar.value > 0 ? 3 : 0)
              return (
                <div key={bar.key} role="listitem" className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-[#344a44] truncate">{bar.label}</span>
                    <span className="font-semibold text-[#12211d] tabular-nums shrink-0">
                      {money(bar.value)}
                      <span className="text-[#5f736e] font-normal ml-1.5">
                        ({formatPercent(bar.value, maxFlow)})
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#e6efec] overflow-hidden">
                    <div
                      className="h-full rounded-full chart-bar-grow"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: bar.color,
                        '--bar-delay': bar.delay,
                      } as CSSProperties}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row: Contract Split + Hotel Sales Status */}
      {(data.contracts.length > 0 || data.hotels.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div
            className="lg:col-span-8 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 space-y-3.5 dash-enter"
            style={{ '--dash-delay': '180ms' } as CSSProperties}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#12211d] m-0">Phân bổ theo hợp đồng</h3>
                <p className="text-xs text-[#5f736e] mt-0.5 mb-0">Top hợp đồng theo doanh thu đã hoàn thành</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#5f736e]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0b5f53]" />
                  <span>Nền tảng</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#5ab099]" />
                  <span>Owner</span>
                </span>
              </div>
            </div>

            {topContracts.length === 0 ? (
              <p className="text-xs text-[#5f736e] py-4 m-0">Chưa có hợp đồng phát sinh doanh thu hoàn thành.</p>
            ) : (
              <div className="space-y-3">
                {topContracts.map((contract, idx) => {
                  const total = contract.platformAmount + contract.ownerAmount
                  const barTotalWidth = total > 0 ? Math.max((total / maxContractTotal) * 100, 4) : 0
                  const platformShare = total > 0 ? (contract.platformAmount / total) * 100 : 0
                  const ownerShare = total > 0 ? (contract.ownerAmount / total) * 100 : 0
                  return (
                    <div
                      key={`${contract.contractId}-${contract.commissionRate}`}
                      className="space-y-1"
                      title={`Nền tảng: ${money(contract.platformAmount)} · Owner: ${money(contract.ownerAmount)}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-semibold text-[#12211d]">{contract.contractCode}</span>
                          <span className="text-[#5f736e] truncate max-w-[200px]">{contract.hotelName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[#eef8f5] text-[#0b5f53] font-medium text-[10.5px] tabular-nums">
                            {contract.commissionRate}% · {contract.completedBookingCount} đơn
                          </span>
                        </div>
                        <span className="font-semibold text-[#12211d] tabular-nums shrink-0">{money(total)}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[#e6efec] overflow-hidden">
                        <div
                          className="h-full flex rounded-full overflow-hidden chart-bar-grow"
                          style={{
                            width: `${barTotalWidth}%`,
                            '--bar-delay': `${idx * 70}ms`,
                          } as CSSProperties}
                        >
                          <div className="h-full bg-[#0b5f53]" style={{ width: `${platformShare}%` }} />
                          <div className="h-full bg-[#5ab099]" style={{ width: `${ownerShare}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div
            className="lg:col-span-4 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 flex flex-col justify-between gap-4 dash-enter"
            style={{ '--dash-delay': '240ms' } as CSSProperties}
          >
            <div>
              <h3 className="text-sm font-semibold text-[#12211d] m-0">Trạng thái mở bán khách sạn</h3>
              <p className="text-xs text-[#5f736e] mt-0.5 mb-0">
                Tổng {totalHotels} khách sạn trong phạm vi theo dõi
              </p>
            </div>

            {totalHotels === 0 ? (
              <p className="text-xs text-[#5f736e] py-4 m-0">Chưa có khách sạn trong danh sách theo dõi.</p>
            ) : (
              <div className="space-y-4">
                <div className="h-3.5 w-full rounded-full bg-[#e6efec] overflow-hidden flex">
                  {openHotelsCount > 0 && (
                    <div
                      className="h-full bg-[#0f7a5f] chart-bar-grow"
                      style={{
                        width: `${(openHotelsCount / totalHotels) * 100}%`,
                        '--bar-delay': '100ms',
                      } as CSSProperties}
                    />
                  )}
                  {pausedHotelsCount > 0 && (
                    <div
                      className="h-full bg-[#d97706] chart-bar-grow"
                      style={{
                        width: `${(pausedHotelsCount / totalHotels) * 100}%`,
                        '--bar-delay': '180ms',
                      } as CSSProperties}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-[#cde9dc] bg-[#eaf6f1] px-3 py-2.5">
                    <div className="text-[11px] font-medium text-[#0f7a5f]">Đang mở bán</div>
                    <div className="text-xl font-bold text-[#08473e] tabular-nums mt-0.5">
                      {openHotelsCount}
                      <span className="text-xs font-medium text-[#0f7a5f] ml-1.5">
                        ({formatPercent(openHotelsCount, totalHotels)})
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#f2dec0] bg-[#fffaf0] px-3 py-2.5">
                    <div className="text-[11px] font-medium text-[#b45309]">Đã ngừng bán</div>
                    <div className="text-xl font-bold text-[#92400e] tabular-nums mt-0.5">
                      {pausedHotelsCount}
                      <span className="text-xs font-medium text-[#b45309] ml-1.5">
                        ({formatPercent(pausedHotelsCount, totalHotels)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
