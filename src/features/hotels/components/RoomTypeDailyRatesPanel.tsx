import { useState } from 'react'
import {
  AppstoreOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  TableOutlined,
} from '@ant-design/icons'
import { Alert, App as AntApp, Button, Input, InputNumber, Segmented, Space, Table, Tag } from 'antd'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { errorMessage } from '@/shared/api/api-error'
import { useDataMode } from '@/shared/lib/data-mode-context'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useRoomTypeDailyRatesQuery } from '../hooks/use-room-type-daily-rates-query'
import { useSetRoomRatesMutation } from '../hooks/use-set-room-rates-mutation'
import { localRateDate, roomRatesRangeSchema, setRoomRatesFormSchema, type SetRoomRatesFormValues } from '../model/room-rates'
import type { DailyRoomRate, ManagementRoomTypeSummary } from '../model/hotel'

interface RoomTypeDailyRatesPanelProps {
  hotelId: string
  hotelName?: string
  roomTypes?: ManagementRoomTypeSummary[]
  hotelStatus?: string
}

type RateViewMode = 'grid' | 'table'

function getWeekdayName(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  const day = date.getUTCDay()
  const names = [
    'Chủ nhật',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
  ]
  return names[day] ?? ''
}

function isWeekendDate(isoDate: string): boolean {
  const weekday = getWeekdayName(isoDate)
  return weekday === 'Thứ 6' || weekday === 'Thứ 7'
}

function formatDisplayDate(isoDate: string): string {
  const parts = isoDate.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDate
}

export function RoomTypeDailyRatesPanel({
  hotelId,
  hotelName,
  roomTypes = [],
  hotelStatus = 'ACTIVE',
}: RoomTypeDailyRatesPanelProps) {
  const { mode } = useDataMode()
  const { message } = AntApp.useApp()
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(
    roomTypes[0]?.id ?? '',
  )
  const { control, setValue, handleSubmit, formState: { errors } } = useForm<SetRoomRatesFormValues>({
    resolver: zodResolver(setRoomRatesFormSchema),
    defaultValues: { startDate: localRateDate(), endDate: localRateDate(), amount: 0 },
  })
  const startDate = useWatch({ control, name: 'startDate' }) ?? ''
  const endDate = useWatch({ control, name: 'endDate' }) ?? ''
  const [viewMode, setViewMode] = useState<RateViewMode>('grid')

  const activeRoomTypeId =
    roomTypes.some((rt) => rt.id === selectedRoomTypeId)
      ? selectedRoomTypeId
      : (roomTypes[0]?.id ?? '')
  const selectedRoomType = roomTypes.find((rt) => rt.id === activeRoomTypeId)
  const canReadRates = mode === 'mock' || (hotelStatus === 'ACTIVE' && selectedRoomType?.isActive === true)
  const rateMutation = useSetRoomRatesMutation(hotelId, activeRoomTypeId)
  const validRange = roomRatesRangeSchema.safeParse({ startDate, endDate }).success

  const ratesQuery = useRoomTypeDailyRatesQuery({
    hotelId,
    roomTypeId: activeRoomTypeId,
    startDate,
    endDate,
  }, canReadRates)

  function applyPresetRange(startIso: string, days: number) {
    const start = new Date(`${startIso}T00:00:00Z`)
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + (days - 1))
    setValue('startDate', start.toISOString().slice(0, 10))
    setValue('endDate', end.toISOString().slice(0, 10))
  }

  if (roomTypes.length === 0) {
    return (
      <div className="surface-card">
        <EmptyState
          title="Khách sạn chưa có hạng phòng nào"
          description="Cần khởi tạo ít nhất 1 hạng phòng trước khi tra cứu bảng giá theo ngày."
        />
      </div>
    )
  }

  const rates = ratesQuery.data ?? []
  const currency = rates[0]?.currency ?? 'VND'
  const knownAmounts = rates.flatMap((rate) => rate.amount === null ? [] : [rate.amount])
  const minAmount =
    knownAmounts.length > 0 ? Math.min(...knownAmounts) : null
  const maxAmount =
    knownAmounts.length > 0 ? Math.max(...knownAmounts) : null
  const weekendCount = rates.filter((item) => isWeekendDate(item.rateDate)).length

  return (
    <section className="rates-scientific-panel" aria-labelledby="daily-rates-title">
      {/* 1. Header tinh gọn của bảng giá */}
      <div className="rates-panel-header">
        <div>
          <span className="rates-panel-header__kicker">
            LỊCH GIÁ NIÊM YẾT THEO NGÀY
          </span>
          <h2 id="daily-rates-title" className="rates-panel-header__title">
            {hotelName ? hotelName : 'Chi tiết giá phòng theo đêm'}
          </h2>
        </div>

        <Space wrap size={10}>
          <Segmented<RateViewMode>
            value={viewMode}
            onChange={setViewMode}
            aria-label="Chọn kiểu hiển thị bảng giá"
            options={[
              {
                value: 'grid',
                label: 'Lưới lịch',
                icon: <AppstoreOutlined aria-hidden="true" />,
              },
              {
                value: 'table',
                label: 'Bảng đối chiếu',
                icon: <TableOutlined aria-hidden="true" />,
              },
            ]}
          />
          <Button
            icon={<ReloadOutlined aria-hidden="true" />}
            onClick={() => void ratesQuery.refetch()}
            loading={ratesQuery.isFetching}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* 2. Bộ chọn Hạng phòng trực quan (Segmented Room Tabs) */}
      <div className="rates-room-tabs" role="tablist" aria-label="Chọn hạng phòng">
        {roomTypes.map((rt) => {
          const isCurrent = rt.id === activeRoomTypeId
          return (
            <button
              key={rt.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              className={`rates-room-tab-btn ${isCurrent ? 'is-active' : ''}`}
              onClick={() => setSelectedRoomTypeId(rt.id)}
            >
              <span className="rates-room-tab-btn__name">{rt.name}</span>
              <span className="rates-room-tab-btn__badge">
                Tối đa {rt.maxAdults} người lớn
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. Dải thông tin bổ trợ hạng phòng đang chọn */}
      {selectedRoomType && (
        <div className="rates-room-infobar">
          <div className="rates-room-infobar__left">
            <InfoCircleOutlined className="rates-room-infobar__icon" aria-hidden="true" />
            <span className="rates-room-infobar__text">
              {selectedRoomType.description ||
                `Hạng phòng ${selectedRoomType.name} — Cấu hình chuẩn cao cấp.`}
            </span>
          </div>
          <div className="rates-room-infobar__tags">
            <Tag color={selectedRoomType.isActive ? 'gold' : 'default'}>
              {selectedRoomType.isActive ? 'Đang mở bán' : 'Tạm ngưng'}
            </Tag>
            {selectedRoomType.totalRooms !== undefined && (
              <Tag>Quỹ phòng: {selectedRoomType.totalRooms} phòng</Tag>
            )}
          </div>
        </div>
      )}

      {/* 4. Thanh điều khiển khoảng ngày (Không lặp lại hạng phòng) */}
      <div className="rates-date-toolbar">
        <div className="rates-date-toolbar__group">
          <span className="rates-date-toolbar__label">Khoảng ngày khảo sát:</span>
          <div className="rates-date-inputs">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setValue('startDate', e.target.value)}
              aria-label="Từ ngày"
              className="rates-date-field"
            />
            <span className="rates-date-separator" aria-hidden="true">
              →
            </span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setValue('endDate', e.target.value)}
              aria-label="Đến ngày"
              className="rates-date-field"
            />
          </div>
        </div>

        <div className="rates-date-toolbar__presets">
          <span className="rates-date-toolbar__presets-label">Xem nhanh:</span>
          <div className="rates-presets-buttons">
            <Button
              size="small"
              onClick={() => applyPresetRange(localRateDate(), 7)}
            >
              7 đêm
            </Button>
            <Button
              size="small"
              onClick={() => applyPresetRange(localRateDate(), 14)}
            >
              14 đêm
            </Button>
            <Button
              size="small"
              onClick={() => applyPresetRange(localRateDate(), 21)}
            >
              21 đêm
            </Button>
          </div>
        </div>
      </div>

      {mode === 'api' && (
        <form onSubmit={handleSubmit(async (values) => {
          try {
            await rateMutation.mutateAsync(values)
            void message.success('Đã lưu giá phòng theo kết quả từ máy chủ.')
          } catch (error) {
            void message.error(errorMessage(error))
          }
        })} className="rates-date-toolbar">
          <Space wrap>
            <span>Giá mỗi đêm trong khoảng ngày đã chọn (VND):</span>
            <Controller name="amount" control={control} render={({ field }) => (
              <InputNumber min={1} precision={0} value={field.value || null}
                onChange={(value) => field.onChange(value ?? 0)}
                aria-label="Giá mỗi đêm" disabled={!canReadRates || rateMutation.isPending} />
            )} />
            <Button type="primary" htmlType="submit" loading={rateMutation.isPending}
              disabled={!canReadRates || !validRange || startDate < localRateDate()}>Lưu giá</Button>
            {errors.amount && <span role="alert">{errors.amount.message}</span>}
          </Space>
        </form>
      )}

      {/* 5. Vùng hiển thị dữ liệu giá */}
      {!canReadRates ? (
        <Alert type="info" showIcon title="Backend hiện chỉ hỗ trợ giá cho khách sạn ACTIVE và loại phòng đang mở bán." />
      ) : !validRange ? (
        <Alert type="warning" showIcon title="Chọn khoảng ngày hợp lệ, tối đa 90 ngày để xem bảng giá." />
      ) : ratesQuery.isPending ? (
        <PageLoading />
      ) : ratesQuery.isError ? (
        <ErrorState
          error={ratesQuery.error}
          retrying={ratesQuery.isFetching}
          onRetry={() => void ratesQuery.refetch()}
        />
      ) : rates.length === 0 ? (
        <EmptyState
          title="Không có dữ liệu giá trong khoảng ngày đã chọn"
          description="Vui lòng chọn khoảng thời gian khác hoặc kiểm tra lại cấu hình giá phòng."
        />
      ) : (
        <>
          {/* Dải số liệu KPI tổng quan */}
          <div className="rates-metric-strip" role="region" aria-label="Tổng quan khoảng giá">
            <div className="rates-metric-item">
              <span className="rates-metric-item__label">Chu kỳ theo dõi</span>
              <div className="rates-metric-item__value">
                <strong>{rates.length}</strong> <span className="unit">đêm</span>
              </div>
              <span className="rates-metric-item__hint">
                Gồm {weekendCount} đêm cuối tuần (Thứ 6 &amp; Thứ 7)
              </span>
            </div>

            <div className="rates-metric-item">
              <span className="rates-metric-item__label">Mức giá thấp nhất</span>
              <div className="rates-metric-item__value">
                {minAmount !== null
                  ? formatCurrencyAmount(minAmount, currency)
                  : '—'}
              </div>
              <span className="rates-metric-item__hint">Áp dụng ngày thường trong tuần</span>
            </div>

            <div className="rates-metric-item is-highlight">
              <span className="rates-metric-item__label">Mức giá cao nhất</span>
              <div className="rates-metric-item__value">
                {maxAmount !== null
                  ? formatCurrencyAmount(maxAmount, currency)
                  : '—'}
              </div>
              <span className="rates-metric-item__hint">Áp dụng cuối tuần &amp; ngày cao điểm</span>
            </div>

            <div className="rates-metric-note">
              <span className="rates-metric-note__title">Đơn vị niêm yết:</span>
              <span className="rates-metric-note__desc">
                {currency} / đêm phòng (Giá thực tế từ hệ thống)
              </span>
            </div>
          </div>

          {/* Dạng 1: Lưới lịch ngày trực quan */}
          {viewMode === 'grid' ? (
            <div
              className="rates-clean-grid"
              role="list"
              aria-label="Lưới lịch giá từng ngày"
            >
              {rates.map((rate) => {
                const weekday = getWeekdayName(rate.rateDate)
                const isWeekend = isWeekendDate(rate.rateDate)
                const hasPremium =
                  minAmount !== null && rate.amount !== null && rate.amount > minAmount
                const premiumPercent =
                  minAmount !== null && minAmount > 0 && rate.amount !== null && hasPremium
                    ? Math.round(((rate.amount - minAmount) / minAmount) * 100)
                    : 0

                return (
                  <article
                    key={`${rate.roomTypeId}-${rate.rateDate}`}
                    role="listitem"
                    className={`rate-clean-cell ${isWeekend ? 'is-weekend' : ''}`}
                  >
                    <div className="rate-clean-cell__top">
                      <span className="rate-clean-cell__weekday">{weekday}</span>
                      <span className="rate-clean-cell__date">
                        {formatDisplayDate(rate.rateDate)}
                      </span>
                    </div>

                    <div className="rate-clean-cell__price">
                      {rate.amount === null ? 'Chưa đặt giá' : formatCurrencyAmount(rate.amount, rate.currency)}
                    </div>

                    <div className="rate-clean-cell__bottom">
                      {isWeekend ? (
                        <span className="rate-clean-cell__status is-weekend">
                          Cuối tuần {premiumPercent > 0 ? `(+${premiumPercent}%)` : ''}
                        </span>
                      ) : (
                        <span className="rate-clean-cell__status">
                          Giá ngày thường
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            /* Dạng 2: Bảng đối chiếu chi tiết */
            <div className="rates-table-wrap">
              <Table<DailyRoomRate>
                rowKey={(record) => `${record.roomTypeId}-${record.rateDate}`}
                dataSource={rates}
                pagination={{ pageSize: 14, showSizeChanger: false }}
                columns={[
                  {
                    title: 'Ngày lưu trú',
                    dataIndex: 'rateDate',
                    key: 'rateDate',
                    render: (value: string) => (
                      <span style={{ fontWeight: 600 }}>
                        <CalendarOutlined aria-hidden="true" style={{ marginRight: 6 }} />
                        {formatDisplayDate(value)}
                      </span>
                    ),
                  },
                  {
                    title: 'Thứ',
                    key: 'weekday',
                    render: (_, record) => {
                      const weekday = getWeekdayName(record.rateDate)
                      const weekend = isWeekendDate(record.rateDate)
                      return (
                        <Tag color={weekend ? 'gold' : 'default'}>
                          {weekday}
                        </Tag>
                      )
                    },
                  },
                  {
                    title: 'Phân loại',
                    key: 'category',
                    render: (_, record) => {
                      const weekend = isWeekendDate(record.rateDate)
                      return (
                        <span className="muted" style={{ fontSize: 13 }}>
                          {weekend ? 'Cuối tuần' : 'Ngày thường'}
                        </span>
                      )
                    },
                  },
                  {
                    title: 'Mức giá niêm yết',
                    dataIndex: 'amount',
                    key: 'amount',
                    align: 'right',
                    render: (amount: number | null, record) => {
                      const isWeekend = isWeekendDate(record.rateDate)
                      return (
                        <strong
                          style={{
                            color: isWeekend
                              ? 'var(--color-primary)'
                              : 'var(--text-primary)',
                            fontSize: '15px',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {amount === null ? 'Chưa đặt giá' : formatCurrencyAmount(amount, record.currency)}
                        </strong>
                      )
                    },
                  },
                  {
                    title: 'Biến động',
                    key: 'variance',
                    align: 'center',
                    render: (_, record) => {
                      if (record.amount === null || minAmount === null || minAmount <= 0 || record.amount <= minAmount) {
                        return <span className="muted" style={{ fontSize: 12 }}>Chuẩn</span>
                      }
                      const diff = Math.round(
                        ((record.amount - minAmount) / minAmount) * 100,
                      )
                      return (
                        <Tag color="orange" style={{ margin: 0 }}>
                          +{diff}%
                        </Tag>
                      )
                    },
                  },
                ]}
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}
