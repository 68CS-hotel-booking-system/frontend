import { useMemo, useState } from 'react'
import { Alert, Button, Empty, Select, Space, Table } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { PageLoading } from '@/shared/ui/PageLoading'
import type { ReportHotelRow, ReportMonthRow } from '../api/reports-api'
import { useOperationsReport } from '../hooks/use-operations-report'

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const compactMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

const formatMoneyOrDash = (value: number | null) => (value === null ? '—' : money(value))

const formatPercentOrDash = (value: number | null) =>
  value === null ? '—' : `${(value * 100).toFixed(1)}%`

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function presetRange(monthsBack: number): { from: string; to: string } {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() - (monthsBack - 1), 1)
  return { from: toIsoDate(start), to: toIsoDate(today) }
}

function diffDays(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime()
  const b = new Date(`${to}T00:00:00Z`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return -1
  return Math.round((b - a) / 86_400_000)
}

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split('-')
  return year && month ? `${month}/${year}` : ym
}

export function OperationsReport() {
  const initial = useMemo(() => presetRange(6), [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [hotelId, setHotelId] = useState<string | undefined>(undefined)

  const rangeDays = diffDays(from, to)
  const rangeError =
    !from || !to
      ? 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.'
      : from > to
        ? 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.'
        : rangeDays > 366
          ? 'Khoảng thời gian báo cáo tối đa là 366 ngày.'
          : null

  const { query, isAdmin, canView } = useOperationsReport(
    { from, to, hotelId },
    rangeError === null,
  )

  if (!canView) return null

  const data = query.data
  const maxMonthRevenue = Math.max(...(data?.months.map((m) => m.roomRevenue) ?? [0]), 0)

  const presets = [
    { label: 'Tháng này', months: 1 },
    { label: '3 tháng', months: 3 },
    { label: '6 tháng', months: 6 },
    { label: '12 tháng', months: 12 },
  ]

  return (
    <section className="surface-card min-w-0 space-y-6" aria-labelledby="operations-report-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="operations-report-title" className="m-0 text-xl font-semibold text-[#12211d]">
            Hiệu suất kinh doanh &amp; công suất phòng
          </h2>
          <p className="muted mt-1 mb-0">
            {isAdmin ? 'Toàn hệ thống khách sạn' : 'Các khách sạn thuộc quyền sở hữu của bạn'}
          </p>
        </div>
        <Button loading={query.isFetching} disabled={Boolean(rangeError)} onClick={() => void query.refetch()}>
          Làm mới báo cáo
        </Button>
      </div>

      {/* Bộ lọc thời gian & khách sạn */}
      <div className="rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="report-from" className="text-xs font-medium text-[#5f736e]">
              Từ ngày
            </label>
            <input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm text-[#12211d]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="report-to" className="text-xs font-medium text-[#5f736e]">
              Đến ngày
            </label>
            <input
              id="report-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm text-[#12211d]"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-[240px]">
            <label htmlFor="report-hotel" className="text-xs font-medium text-[#5f736e]">
              Khách sạn
            </label>
            <Select
              id="report-hotel"
              value={hotelId ?? '__ALL__'}
              onChange={(value) => setHotelId(value === '__ALL__' ? undefined : value)}
              options={[
                { value: '__ALL__', label: 'Tất cả khách sạn' },
                ...(data?.scopeHotels ?? []).map((h) => ({
                  value: h.hotelId,
                  label: h.hotelName,
                })),
              ]}
            />
          </div>
        </div>

        <Space wrap size={8}>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              size="small"
              onClick={() => {
                const next = presetRange(preset.months)
                setFrom(next.from)
                setTo(next.to)
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Space>
      </div>

      {rangeError ? (
        <Alert type="warning" showIcon title={rangeError} />
      ) : query.isPending ? (
        <PageLoading />
      ) : query.isError ? (
        <Alert
          type="error"
          showIcon
          title="Chưa tải được báo cáo vận hành"
          description={errorMessage(query.error)}
          action={
            <Button loading={query.isFetching} onClick={() => void query.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : data ? (
        <>
          {/* KPI chính */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Tỷ lệ lấp đầy',
                value: formatPercentOrDash(data.totals.occupancyRate),
                hint: `${data.totals.soldRoomNights.toLocaleString('vi-VN')} / ${data.totals.availableRoomNights.toLocaleString('vi-VN')} đêm phòng`,
              },
              {
                label: 'Giá phòng bình quân (ADR)',
                value: formatMoneyOrDash(data.totals.adr),
                hint: 'Doanh thu phòng / đêm đã bán',
              },
              {
                label: 'Doanh thu / phòng khả dụng (RevPAR)',
                value: formatMoneyOrDash(data.totals.revpar),
                hint: 'Doanh thu phòng / đêm khả dụng',
              },
              {
                label: 'Doanh thu tiền phòng',
                value: money(data.totals.roomRevenue),
                hint: 'Giá phòng trước giảm giá',
              },
            ].map(({ label, value, hint }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-[#dce7e3] bg-[#fafdfc] p-4"
              >
                <dt className="text-xs font-medium text-[#5f736e]">{label}</dt>
                <dd className="m-0 mt-2 break-words text-2xl font-semibold tabular-nums text-[#12211d]">
                  {value}
                </dd>
                <p className="muted m-0 mt-1 text-xs">{hint}</p>
              </div>
            ))}
          </dl>

          {/* KPI vận hành phụ */}
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Doanh thu lưu trú hoàn thành', value: money(data.totals.completedRevenue) },
              { label: 'Đơn đặt phòng mới', value: data.totals.newBookings.toLocaleString('vi-VN') },
              { label: 'Đơn hủy', value: data.totals.cancelledBookings.toLocaleString('vi-VN') },
              { label: 'Không đến (No-show)', value: data.totals.noShowBookings.toLocaleString('vi-VN') },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[#e6efec] bg-white p-3">
                <dt className="text-xs text-[#5f736e]">{label}</dt>
                <dd className="m-0 mt-1 text-lg font-semibold tabular-nums text-[#12211d]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Biểu đồ cột doanh thu & tỷ lệ lấp đầy theo tháng */}
          <div className="rounded-xl border border-[#dce7e3] bg-white p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="m-0 text-base font-semibold text-[#12211d]">
                Doanh thu tiền phòng &amp; tỷ lệ lấp đầy theo tháng
              </h3>
              <span className="text-xs text-[#5f736e]">
                {data.from} → {data.to}
              </span>
            </div>

            {data.months.length === 0 ? (
              <Empty description="Không có dữ liệu tháng trong khoảng thời gian đã chọn." />
            ) : (
              <div className="overflow-x-auto pb-2">
                <div
                  className="flex items-end gap-3 min-w-[480px] h-56 pt-6 px-2"
                  role="img"
                  aria-label="Biểu đồ doanh thu tiền phòng theo tháng"
                >
                  {data.months.map((m) => {
                    const heightPct =
                      maxMonthRevenue > 0
                        ? Math.max(Math.round((m.roomRevenue / maxMonthRevenue) * 100), m.roomRevenue > 0 ? 6 : 2)
                        : 2
                    return (
                      <div
                        key={m.month}
                        className="flex-1 min-w-[56px] h-full flex flex-col items-center justify-end gap-1"
                      >
                        <span className="text-[11px] font-medium tabular-nums text-[#12211d]">
                          {compactMoney(m.roomRevenue)}
                        </span>
                        <div className="w-full max-w-[44px] flex-1 flex items-end">
                          <div
                            className="w-full rounded-t-md bg-[#0b5f53] transition-all"
                            style={{ height: `${heightPct}%` }}
                            title={`${formatMonthLabel(m.month)}: ${money(m.roomRevenue)} · Lấp đầy ${formatPercentOrDash(m.occupancyRate)}`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#0b5f53] tabular-nums">
                          {formatPercentOrDash(m.occupancyRate)}
                        </span>
                        <span className="text-xs text-[#5f736e] tabular-nums">
                          {formatMonthLabel(m.month)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bảng chi tiết theo tháng */}
          <div className="space-y-2">
            <h3 className="m-0 text-base font-semibold text-[#12211d]">Chi tiết theo tháng</h3>
            <Table<ReportMonthRow>
              rowKey="month"
              size="small"
              scroll={{ x: 960 }}
              pagination={false}
              dataSource={data.months}
              columns={[
                { title: 'Tháng', dataIndex: 'month', render: (m: string) => formatMonthLabel(m) },
                { title: 'Đêm khả dụng', dataIndex: 'availableRoomNights', align: 'right' },
                { title: 'Đêm đã bán', dataIndex: 'soldRoomNights', align: 'right' },
                {
                  title: 'Tỷ lệ lấp đầy',
                  dataIndex: 'occupancyRate',
                  align: 'right',
                  render: (v: number | null) => formatPercentOrDash(v),
                },
                {
                  title: 'Doanh thu phòng',
                  dataIndex: 'roomRevenue',
                  align: 'right',
                  render: (v: number) => money(v),
                },
                {
                  title: 'ADR',
                  dataIndex: 'adr',
                  align: 'right',
                  render: (v: number | null) => formatMoneyOrDash(v),
                },
                {
                  title: 'RevPAR',
                  dataIndex: 'revpar',
                  align: 'right',
                  render: (v: number | null) => formatMoneyOrDash(v),
                },
                {
                  title: 'Hoàn thành',
                  dataIndex: 'completedRevenue',
                  align: 'right',
                  render: (v: number) => money(v),
                },
                { title: 'Đơn mới', dataIndex: 'newBookings', align: 'right' },
                { title: 'Hủy', dataIndex: 'cancelledBookings', align: 'right' },
                { title: 'No-show', dataIndex: 'noShowBookings', align: 'right' },
              ]}
            />
          </div>

          {/* Bảng theo khách sạn */}
          <div className="space-y-2">
            <h3 className="m-0 text-base font-semibold text-[#12211d]">Phân tích theo khách sạn</h3>
            <Table<ReportHotelRow>
              rowKey="hotelId"
              size="small"
              scroll={{ x: 860 }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              dataSource={data.hotels}
              locale={{ emptyText: 'Chưa có khách sạn trong phạm vi báo cáo.' }}
              columns={[
                {
                  title: 'Khách sạn',
                  dataIndex: 'hotelName',
                  render: (name: string, row) => <Link to={`/hotels/${row.hotelId}`}>{name}</Link>,
                },
                { title: 'Đêm khả dụng', dataIndex: 'availableRoomNights', align: 'right' },
                { title: 'Đêm đã bán', dataIndex: 'soldRoomNights', align: 'right' },
                {
                  title: 'Tỷ lệ lấp đầy',
                  dataIndex: 'occupancyRate',
                  align: 'right',
                  render: (v: number | null) => formatPercentOrDash(v),
                },
                {
                  title: 'Doanh thu phòng',
                  dataIndex: 'roomRevenue',
                  align: 'right',
                  render: (v: number) => money(v),
                },
                {
                  title: 'ADR',
                  dataIndex: 'adr',
                  align: 'right',
                  render: (v: number | null) => formatMoneyOrDash(v),
                },
                {
                  title: 'RevPAR',
                  dataIndex: 'revpar',
                  align: 'right',
                  render: (v: number | null) => formatMoneyOrDash(v),
                },
                {
                  title: 'Lưu trú hoàn thành',
                  dataIndex: 'completedRevenue',
                  align: 'right',
                  render: (v: number) => money(v),
                },
              ]}
            />
          </div>

          <p className="muted text-xs m-0">
            Ghi chú: Doanh thu tiền phòng tính theo giá niêm yết từng đêm trước giảm giá của các đơn
            đã xác nhận, đang ở và đã trả phòng. Đêm phòng khả dụng tính theo thời gian vận hành của
            phòng vật lý và không trừ lịch chặn phòng (room-block). Mọi mốc ngày tính theo giờ Việt
            Nam (Asia/Ho_Chi_Minh).
          </p>
        </>
      ) : null}
    </section>
  )
}
