import { useState } from 'react'
import '@/shared/styles/management-pricing.css'
import { AppstoreOutlined, EditOutlined, ReloadOutlined, TableOutlined } from '@ant-design/icons'
import { Alert, App as AntApp, Button, DatePicker, Form, InputNumber, Modal, Segmented, Select, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { errorMessage } from '@/shared/api/api-error'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useRoomTypeDailyRatesQuery } from '../hooks/use-room-type-daily-rates-query'
import { useSetRoomRatesMutation } from '../hooks/use-set-room-rates-mutation'
import { localRateDate, rateRangeEnd, roomRatesRangeSchema, setRoomRatesFormSchema, type SetRoomRatesFormValues } from '../model/room-rates'
import type { DailyRoomRate, ManagementRoomTypeSummary } from '../model/hotel'

interface RoomTypeDailyRatesPanelProps {
  hotelId: string
  hotelName?: string
  roomTypes?: ManagementRoomTypeSummary[]
  hotelStatus?: string
}

const sourceLabels = { RATE: 'Giá riêng', BASE: 'Giá cơ bản', NONE: 'Chưa có giá hợp lệ' } as const
const displayDate = (date: string) => dayjs(date).format('DD/MM/YYYY')
const money = (amount: number | null) => amount === null ? '—' : formatCurrencyAmount(amount, 'VND')

function PriceSourceTag({ source }: { source: DailyRoomRate['source'] }) {
  return <Tag className={`!m-0 !rounded-lg !text-xs ${source === 'RATE' ? '!bg-[#e2f2ee] !text-[#085c50] !border-transparent' : source === 'NONE' ? '!bg-[#fff4dc] !text-[#805100] !border-transparent' : '!bg-[#f1f4f3] !text-[#435b52] !border-transparent'}`}>
    {sourceLabels[source]}
  </Tag>
}

export function RoomTypeDailyRatesPanel({ hotelId, hotelName, roomTypes = [], hotelStatus = 'ACTIVE' }: RoomTypeDailyRatesPanelProps) {
  const { message } = AntApp.useApp()
  const [selectedId, setSelectedId] = useState(roomTypes[0]?.id ?? '')
  const roomTypeId = roomTypes.some((room) => room.id === selectedId) ? selectedId : roomTypes[0]?.id ?? ''
  const selectedRoom = roomTypes.find((room) => room.id === roomTypeId)
  const basePriceLabel = selectedRoom?.basePrice === undefined ? 'Chưa tải được giá cơ bản' : selectedRoom.basePrice > 0 ? money(selectedRoom.basePrice) : 'Chưa có giá cơ bản'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [editingRate, setEditingRate] = useState<DailyRoomRate | null>(null)
  const [singleAmount, setSingleAmount] = useState<number | null>(null)
  const [singleError, setSingleError] = useState<string | null>(null)
  const today = localRateDate()
  const { control, setValue, clearErrors, handleSubmit, formState: { errors } } = useForm<SetRoomRatesFormValues>({
    resolver: zodResolver(setRoomRatesFormSchema),
    defaultValues: { startDate: today, endDate: rateRangeEnd(today, 7), amount: 0 },
  })
  const startDate = useWatch({ control, name: 'startDate' }) ?? today
  const endDate = useWatch({ control, name: 'endDate' }) ?? today
  const validRange = roomRatesRangeSchema.safeParse({ startDate, endDate }).success
  const canRead = hotelStatus !== 'LOCKED' && selectedRoom?.isActive === true
  const ratesQuery = useRoomTypeDailyRatesQuery({ hotelId, roomTypeId, startDate, endDate }, canRead)
  const mutation = useSetRoomRatesMutation(hotelId, roomTypeId)
  const rates = ratesQuery.data ?? []
  const canWrite = canRead && validRange && ratesQuery.isSuccess && !ratesQuery.isError && !ratesQuery.isFetching && !mutation.isPending
  const baseCount = rates.filter((rate) => rate.source === 'BASE').length
  const customCount = rates.filter((rate) => rate.source === 'RATE').length
  const missingCount = rates.filter((rate) => rate.source === 'NONE').length
  // Chỉ tổng hợp dữ liệu giá hiệu lực do Pricing trả về; không chọn giá hoặc tính tiền đặt phòng.
  const amounts = rates.flatMap((rate) => rate.effectivePrice === null ? [] : [rate.effectivePrice])
  const minPrice = amounts.length ? Math.min(...amounts) : null
  const maxPrice = amounts.length ? Math.max(...amounts) : null
  const periodDays = validRange ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1 : 0

  function changeRange(start: string, end: string) {
    setValue('startDate', start)
    setValue('endDate', end)
    clearErrors()
    setEditingRate(null)
  }

  function openDay(rate: DailyRoomRate) {
    if (!canWrite || rate.rateDate < localRateDate()) return
    setEditingRate(rate)
    setSingleAmount(rate.effectivePrice)
    setSingleError(null)
  }

  async function saveSingleDay() {
    if (!editingRate || !canWrite) return
    if (editingRate.rateDate < localRateDate()) {
      setSingleError('Không thể sửa giá cho ngày trong quá khứ.')
      return
    }
    if (singleAmount === null || !Number.isSafeInteger(singleAmount) || singleAmount <= 0) {
      setSingleError('Nhập giá nguyên dương hợp lệ bằng VND.')
      return
    }
    try {
      setSingleError(null)
      await mutation.mutateAsync({ startDate: editingRate.rateDate, amount: singleAmount })
      message.success(`Đã lưu giá riêng ngày ${displayDate(editingRate.rateDate)}.`)
      setEditingRate(null)
    } catch (error) {
      setSingleError(errorMessage(error))
    }
  }

  if (!roomTypes.length) return <section className="rounded-2xl border border-[#dce7e3] bg-white p-6">
    <EmptyState title="Chưa có hạng phòng" description="Tạo hạng phòng và thiết lập giá cơ bản trước khi quản lý giá theo ngày."
      action={<Button href={`/hotels/${hotelId}/rooms/new?tab=room-type`}>Tạo hạng phòng</Button>} />
  </section>

  return <section className="hotel-pricing-panel min-w-0 rounded-2xl border border-[#dce7e3] bg-white text-[#12211d]" aria-labelledby="daily-rates-title">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce7e3] px-4 py-4 sm:px-6">
      <div>
        <h2 id="daily-rates-title" className="m-0 !text-lg font-semibold">{hotelName ?? 'Lịch giá hạng phòng'}</h2>
        <p className="m-0 mt-1 text-sm text-[#5f736e]">Giá cơ bản và giá riêng theo ngày.</p>
      </div>
      <Button icon={<ReloadOutlined />} onClick={() => void ratesQuery.refetch()} loading={ratesQuery.isFetching}
        disabled={!canRead || !validRange || mutation.isPending}>Làm mới</Button>
    </header>

    <div className="space-y-5 p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <label htmlFor="pricing-room-type" className="mb-2 block text-sm font-medium">Hạng phòng</label>
          <Select id="pricing-room-type" aria-label="Hạng phòng" className="w-full" value={roomTypeId}
            disabled={mutation.isPending}
            onChange={(value) => { setSelectedId(value); setEditingRate(null); setValue('amount', 0); clearErrors() }}
            options={roomTypes.map((room) => ({ value: room.id, label: `${room.name}${roomTypes.filter((other) => other.name === room.name).length > 1 ? ` · …${room.id.slice(-4)}` : ''}${room.isActive ? '' : ' · Tạm ngưng'}` }))} />
          <p className="mb-0 mt-2 text-xs text-[#5f736e]">Tối đa {selectedRoom?.maxAdults} người lớn · {selectedRoom?.maxChildren ?? 0} trẻ em</p>
        </div>
        <div className="min-w-0 rounded-xl bg-[#f4f8f7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Giá cơ bản / phòng / đêm</span>
            <Button type="link" href={`/hotels/${hotelId}/rooms`} className="!p-0">Sửa hạng phòng</Button>
          </div>
          <div className="mt-1 break-words text-xl font-semibold tabular-nums">
            {basePriceLabel}
          </div>
          <p className="mb-0 mt-1 text-xs leading-relaxed text-[#5f736e]">Ngày chưa có giá riêng sẽ dùng giá cơ bản. Giá riêng thay thế giá cơ bản của ngày đó.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 w-full sm:w-auto">
          <label htmlFor="pricing-date-range" className="mb-2 block text-sm font-medium">Khoảng ngày hiển thị</label>
          <DatePicker.RangePicker id={{ start: 'pricing-date-range', end: 'pricing-date-range-end' }}
            value={[dayjs(startDate), dayjs(endDate)]} format="DD/MM/YYYY" allowClear={false}
            disabled={mutation.isPending} className="w-full sm:w-auto"
            onChange={(dates) => { if (dates?.[0] && dates[1]) changeRange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')) }} />
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Chu kỳ hiển thị">
          {[7, 14, 30].map((days) => <Button key={days} aria-pressed={periodDays === days}
            type={periodDays === days ? 'primary' : 'default'} disabled={mutation.isPending}
            onClick={() => changeRange(startDate, rateRangeEnd(startDate, days))}>{days} ngày</Button>)}
        </div>
      </div>

      {!canRead ? <Alert type="info" showIcon title={hotelStatus === 'LOCKED' ? 'Khách sạn đang bị khóa' : 'Hạng phòng đã tạm ngưng mở bán'}
        description="Kiểm tra trạng thái trước khi quản lý giá theo ngày." />
        : !validRange ? <Alert type="warning" showIcon title="Chọn khoảng ngày hợp lệ, tối đa 90 ngày để xem lịch giá." />
        : ratesQuery.isPending ? <PageLoading />
        : ratesQuery.isError ? <div role="alert">
          <Alert type="error" showIcon title="Không thể tải lịch giá" description={errorMessage(ratesQuery.error)} />
          <Button className="mt-3" onClick={() => void ratesQuery.refetch()} loading={ratesQuery.isFetching}>Thử lại</Button>
        </div>
        : <>
          <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#dce7e3] py-4 lg:grid-cols-5" aria-label="Tóm tắt cấu hình giá">
            {[
              ['Dùng giá cơ bản', `${baseCount} ngày`], ['Có giá riêng', `${customCount} ngày`],
              ['Thiếu giá hợp lệ', `${missingCount} ngày`], ['Giá thấp nhất', money(minPrice)], ['Giá cao nhất', money(maxPrice)],
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-[#5f736e]">{label}</dt>
              <dd className="m-0 mt-1 break-words text-base font-semibold tabular-nums">{value}</dd></div>)}
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm text-[#5f736e]">Chọn ngày để chỉnh giá riêng.</p>
            <Segmented value={viewMode} onChange={(value) => setViewMode(value as 'grid' | 'table')} aria-label="Kiểu hiển thị lịch giá"
              options={[{ value: 'grid', label: 'Lưới lịch', icon: <AppstoreOutlined /> }, { value: 'table', label: 'Bảng giá', icon: <TableOutlined /> }]} />
          </div>
          {viewMode === 'grid' ? <div className="grid grid-cols-[repeat(auto-fit,minmax(136px,1fr))] gap-3" aria-label="Lưới giá theo ngày" aria-busy={ratesQuery.isFetching}>
            {rates.map((rate) => {
              const past = rate.rateDate < today
              const weekday = dayjs(rate.rateDate).day()
              const weekend = weekday === 0 || weekday === 6
              return <button type="button" key={rate.rateDate} onClick={() => openDay(rate)} disabled={past || !canWrite}
                aria-label={`${displayDate(rate.rateDate)}: ${rate.effectivePrice === null ? sourceLabels.NONE : money(rate.effectivePrice)}, ${sourceLabels[rate.source]}${past ? ', chỉ xem' : ''}`}
                className={`flex min-w-0 flex-col items-start rounded-xl border p-3 text-left transition-colors disabled:cursor-default ${rate.source === 'RATE' ? 'border-[#8dbdb5] bg-[#f0f8f6]' : 'border-[#dce7e3] bg-white'} ${!past && canWrite ? 'cursor-pointer hover:bg-[#edf5f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5f53]' : ''}`}>
                <span className={`text-sm font-medium ${weekend ? 'text-[#8a5a00]' : 'text-[#344a44]'}`}>
                  {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][weekday]}
                </span>
                <span className="mt-1 text-xs text-[#5f736e]">{dayjs(rate.rateDate).format('DD/MM')}{rate.rateDate === today ? ' · Hôm nay' : ''}</span>
                <span className="my-3 w-full break-words text-base font-semibold tabular-nums">{money(rate.effectivePrice)}</span>
                <PriceSourceTag source={rate.source} />
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#0b5f53]">
                  {!past && <EditOutlined />}{past ? 'Chỉ xem' : 'Chỉnh giá riêng'}
                </span>
              </button>
            })}
          </div> : <Table<DailyRoomRate> rowKey="rateDate" size="middle" dataSource={rates} scroll={{ x: 620 }}
            pagination={{ pageSize: 14, showSizeChanger: false, hideOnSinglePage: true }} columns={[
              { title: 'Ngày', dataIndex: 'rateDate', render: (value: string) => displayDate(value) },
              { title: 'Giá áp dụng', dataIndex: 'effectivePrice', render: (value: number | null) => money(value) },
              { title: 'Nguồn giá', dataIndex: 'source', render: (source: DailyRoomRate['source']) => <PriceSourceTag source={source} /> },
              { title: 'Thao tác', key: 'action', render: (_, rate) => rate.rateDate < today ? 'Chỉ xem' : <Button size="small" disabled={!canWrite} onClick={() => openDay(rate)}>Chỉnh giá riêng</Button> },
            ]} />}
        </>}

      <form className="border-t border-[#dce7e3] pt-5" onSubmit={handleSubmit(async (values) => {
        if (!canWrite || values.startDate < localRateDate()) return
        try {
          await mutation.mutateAsync(values)
          message.success(`Đã đặt giá riêng cho ${periodDays} ngày.`)
        } catch (error) { message.error(errorMessage(error)) }
      })}>
        <h3 className="m-0 text-sm font-semibold">Đặt giá riêng cho khoảng ngày</h3>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-[#5f736e]">Ghi đè giá riêng từ {displayDate(startDate)} đến {displayDate(endDate)}. Không thay đổi giá cơ bản.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Form.Item className="!mb-0 sm:w-64" label="Giá riêng mỗi đêm (VND)" htmlFor="bulk-night-price" layout="vertical"
            validateStatus={errors.amount ? 'error' : undefined} help={errors.amount?.message}>
            <Controller name="amount" control={control} render={({ field }) => <InputNumber controls={false} keyboard={false} changeOnWheel={false} inputMode="numeric" id="bulk-night-price" className="!w-full"
              min={1} max={Number.MAX_SAFE_INTEGER} precision={0} value={field.value || null} onChange={(value) => field.onChange(value ?? 0)}
              placeholder="Nhập số tiền" disabled={!canWrite} />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} disabled={!canWrite || startDate < today}>
            Áp dụng {periodDays} ngày
          </Button>
        </div>
        {startDate < today && <p className="mb-0 mt-2 text-xs text-[#8a5a00]">Ngày quá khứ chỉ được xem. Chọn khoảng từ hôm nay để đặt giá riêng.</p>}
      </form>
    </div>

    <Modal title={editingRate ? `Đặt giá riêng · ${displayDate(editingRate.rateDate)}` : 'Đặt giá riêng'} open={editingRate !== null}
      onCancel={() => { if (!mutation.isPending) setEditingRate(null) }} onOk={() => void saveSingleDay()}
      okText="Lưu giá riêng" cancelText="Hủy" confirmLoading={mutation.isPending} closable={!mutation.isPending}
      mask={{ closable: !mutation.isPending }} cancelButtonProps={{ disabled: mutation.isPending }}
      okButtonProps={{ disabled: !canWrite || singleAmount === null || !Number.isSafeInteger(singleAmount) || singleAmount <= 0 }}>
      <p className="mb-4 text-sm text-[#5f736e]">{selectedRoom?.name}</p>
      <dl className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f4f8f7] p-3 text-sm">
        <div><dt className="text-xs text-[#5f736e]">Giá cơ bản</dt><dd className="m-0 mt-1 font-medium">{basePriceLabel}</dd></div>
        <div><dt className="text-xs text-[#5f736e]">Giá đang áp dụng</dt><dd className="m-0 mt-1 font-medium">{editingRate ? money(editingRate.effectivePrice) : '—'}{editingRate && <div className="mt-1"><PriceSourceTag source={editingRate.source} /></div>}</dd></div>
      </dl>
      <Form.Item label="Giá riêng mới (VND / phòng / đêm)" htmlFor="single-night-price" layout="vertical"
        validateStatus={singleError ? 'error' : undefined} help={singleError}>
        <InputNumber controls={false} keyboard={false} changeOnWheel={false} inputMode="numeric" id="single-night-price" className="!w-full" min={1} max={Number.MAX_SAFE_INTEGER} precision={0}
          value={singleAmount} onChange={(value) => { setSingleAmount(value); setSingleError(null) }} disabled={mutation.isPending} placeholder="Nhập số tiền" />
      </Form.Item>
      <p className="mb-0 text-xs leading-relaxed text-[#5f736e]">Chỉ thay đổi ngày được chọn. Giá cơ bản và các ngày khác giữ nguyên.</p>
    </Modal>
  </section>
}
