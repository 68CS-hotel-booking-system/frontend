import { useId, useState } from 'react'
import {
  CalendarOutlined,
  EnvironmentOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from 'antd'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { smartSearchSchema, type SmartSearchFormValues } from '../model/search-form-schema'
import { QUICK_LOCATION_SUGGESTIONS } from '../mocks/stayvibe-mock-data'

interface SmartSearchBarProps {
  onSearchSubmit: (values: SmartSearchFormValues) => void
  onResetSearch: () => void
  activeDestinationFilter: string
}

type SearchSegment = 'location' | 'dates' | 'guests' | null

function computeNightsCount(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1
  }
  const diffDays = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(1, diffDays)
}

export function SmartSearchBar({
  onSearchSubmit,
  onResetSearch,
  activeDestinationFilter,
}: SmartSearchBarProps) {
  const formId = useId()
  const [activeSegment, setActiveSegment] = useState<SearchSegment>(null)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SmartSearchFormValues>({
    resolver: zodResolver(smartSearchSchema),
    defaultValues: {
      destination: activeDestinationFilter,
      checkIn: '2026-11-15',
      checkOut: '2026-11-18',
      guests: 2,
      rooms: 1,
      petFriendly: false,
    },
  })

  const checkInValue = useWatch({ control, name: 'checkIn' })
  const checkOutValue = useWatch({ control, name: 'checkOut' })
  const guestsValue = useWatch({ control, name: 'guests' })
  const roomsValue = useWatch({ control, name: 'rooms' })
  const petFriendlyValue = useWatch({ control, name: 'petFriendly' })
  const destinationValue = useWatch({ control, name: 'destination' })

  const totalNights = computeNightsCount(checkInValue, checkOutValue)

  function handleQuickSelectCity(city: string) {
    setValue('destination', city, { shouldDirty: true })
    setActiveSegment(null)
    onSearchSubmit({
      destination: city,
      checkIn: checkInValue,
      checkOut: checkOutValue,
      guests: guestsValue,
      rooms: roomsValue,
      petFriendly: petFriendlyValue,
    })
  }

  return (
    <div className="w-full flex flex-col gap-3.5">
      <form
        className="w-full bg-white text-[#141413] rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-[#DECBA4]/50 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.4fr_1.3fr_1.25fr_auto] gap-2 items-center transition-all"
        onSubmit={(event) => void handleSubmit(onSearchSubmit)(event)}
        noValidate
        aria-label="Thanh tìm kiếm thông minh StayVibe"
      >
        {/* Phân vùng 1: Địa điểm */}
        <div
          className={`flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-xl border transition-colors duration-150 min-w-0 w-full ${
            activeSegment === 'location'
              ? 'bg-[#FAF8F5] border-[#A67C37]/50 ring-1 ring-[#A67C37]/30'
              : 'border-transparent hover:bg-[#FAF8F5]'
          }`}
          onFocus={() => setActiveSegment('location')}
        >
          <div className="w-9 h-9 rounded-lg bg-[#F9F5EB] border border-[#DECBA4]/60 text-[#A67C37] flex items-center justify-center text-sm shrink-0" aria-hidden="true">
            <EnvironmentOutlined />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <label
              htmlFor={`${formId}-destination`}
              className="text-[10px] font-bold uppercase tracking-wider text-[#7A7468]"
            >
              Địa điểm
            </label>
            <Controller
              control={control}
              name="destination"
              render={({ field }) => (
                <input
                  {...field}
                  id={`${formId}-destination`}
                  type="text"
                  className="w-full bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#141413] placeholder:text-[#7A7468]/70 p-0"
                  placeholder="Điểm đến hoặc tên chỗ nghỉ..."
                  autoComplete="off"
                />
              )}
            />
          </div>
        </div>

        {/* Phân vùng 2: Ngày nhận - trả phòng */}
        <div
          className={`flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-xl border transition-colors duration-150 min-w-0 w-full ${
            activeSegment === 'dates'
              ? 'bg-[#FAF8F5] border-[#A67C37]/50 ring-1 ring-[#A67C37]/30'
              : 'border-transparent hover:bg-[#FAF8F5]'
          }`}
          onFocus={() => setActiveSegment('dates')}
        >
          <div className="w-9 h-9 rounded-lg bg-[#F9F5EB] border border-[#DECBA4]/60 text-[#A67C37] flex items-center justify-center text-sm shrink-0" aria-hidden="true">
            <CalendarOutlined />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={`${formId}-checkin`}
                className="text-[10px] font-bold uppercase tracking-wider text-[#7A7468]"
              >
                Nhận — Trả phòng
              </label>
              <span className="bg-[#F9F5EB] text-[#A67C37] border border-[#DECBA4]/60 text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                {totalNights} đêm
              </span>
            </div>
            <div className="flex items-center gap-2 w-full min-w-0">
              <Controller
                control={control}
                name="checkIn"
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${formId}-checkin`}
                    type="date"
                    aria-label="Ngày nhận phòng"
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#141413] p-0 cursor-pointer tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                )}
              />
              <span className="text-[#A67C37] text-xs font-bold shrink-0" aria-hidden="true">
                →
              </span>
              <Controller
                control={control}
                name="checkOut"
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${formId}-checkout`}
                    type="date"
                    aria-label="Ngày trả phòng"
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-[#141413] p-0 cursor-pointer tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                )}
              />
            </div>
            {errors.checkOut && (
              <span className="text-[11px] text-[#B93829] font-medium" role="alert">
                {errors.checkOut.message}
              </span>
            )}
          </div>
        </div>

        {/* Phân vùng 3: Số lượng khách & phòng */}
        <div
          className={`flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-xl border transition-colors duration-150 min-w-0 w-full ${
            activeSegment === 'guests'
              ? 'bg-[#FAF8F5] border-[#A67C37]/50 ring-1 ring-[#A67C37]/30'
              : 'border-transparent hover:bg-[#FAF8F5]'
          }`}
          onFocus={() => setActiveSegment('guests')}
        >
          <div className="w-9 h-9 rounded-lg bg-[#F9F5EB] border border-[#DECBA4]/60 text-[#A67C37] flex items-center justify-center text-sm shrink-0" aria-hidden="true">
            <TeamOutlined />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7468]">
              Khách &amp; Phòng
            </span>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="inline-flex items-center gap-1.5" aria-label="Số lượng khách">
                <button
                  type="button"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#CFC7B8] bg-[#FAF8F5] text-[#141413] inline-flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] hover:bg-[#F9F5EB] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Giảm số khách"
                  disabled={guestsValue <= 1}
                  onClick={() =>
                    setValue('guests', Math.max(1, guestsValue - 1), {
                      shouldDirty: true,
                    })
                  }
                >
                  <MinusOutlined />
                </button>
                <span className="text-xs sm:text-sm font-semibold tabular-nums text-[#141413]">
                  {guestsValue} khách
                </span>
                <button
                  type="button"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#CFC7B8] bg-[#FAF8F5] text-[#141413] inline-flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] hover:bg-[#F9F5EB] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Tăng số khách"
                  disabled={guestsValue >= 16}
                  onClick={() =>
                    setValue('guests', Math.min(16, guestsValue + 1), {
                      shouldDirty: true,
                    })
                  }
                >
                  <PlusOutlined />
                </button>
              </div>

              <span className="text-[#7A7468] text-xs" aria-hidden="true">·</span>

              <div className="inline-flex items-center gap-1.5" aria-label="Số lượng phòng">
                <button
                  type="button"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#CFC7B8] bg-[#FAF8F5] text-[#141413] inline-flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] hover:bg-[#F9F5EB] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Giảm số phòng"
                  disabled={roomsValue <= 1}
                  onClick={() =>
                    setValue('rooms', Math.max(1, roomsValue - 1), {
                      shouldDirty: true,
                    })
                  }
                >
                  <MinusOutlined />
                </button>
                <span className="text-xs sm:text-sm font-semibold tabular-nums text-[#141413]">
                  {roomsValue} phòng
                </span>
                <button
                  type="button"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#CFC7B8] bg-[#FAF8F5] text-[#141413] inline-flex items-center justify-center text-xs hover:border-[#A67C37] hover:text-[#A67C37] hover:bg-[#F9F5EB] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Tăng số phòng"
                  disabled={roomsValue >= 8}
                  onClick={() =>
                    setValue('rooms', Math.min(8, roomsValue + 1), {
                      shouldDirty: true,
                    })
                  }
                >
                  <PlusOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phân vùng 4: Nút CTA Tìm kiếm */}
        <div className="w-full xl:w-auto">
          <button
            type="submit"
            className="w-full xl:w-auto h-12 px-7 rounded-xl bg-[#141413] !text-[#FAF8F5] hover:bg-[#A67C37] hover:!text-white transition-colors duration-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <SearchOutlined aria-hidden="true" />
            <span>Khám phá</span>
          </button>
        </div>
      </form>

      {/* Thanh phụ dưới Search Bar: Gợi ý điểm đến nhanh + Toggle thú cưng */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 text-xs text-white/90">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/70 text-xs font-medium">Điểm đến xu hướng:</span>
          {QUICK_LOCATION_SUGGESTIONS.map((city) => {
            const isSelected =
              destinationValue.toLowerCase() === city.toLowerCase()
            return (
              <button
                key={city}
                type="button"
                className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#A67C37] !text-white border border-[#E5C98B] font-semibold'
                    : 'bg-black/40 !text-white/90 border border-white/20 hover:border-[#E5C98B] hover:!text-[#E5C98B]'
                }`}
                onClick={() => handleQuickSelectCity(city)}
              >
                {city}
              </button>
            )
          })}
          {(destinationValue || petFriendlyValue) && (
            <button
              type="button"
              className="text-xs text-white/70 hover:text-white underline cursor-pointer ml-1"
              onClick={() => {
                reset({
                  destination: '',
                  checkIn: '2026-11-15',
                  checkOut: '2026-11-18',
                  guests: 2,
                  rooms: 1,
                  petFriendly: false,
                })
                onResetSearch()
              }}
            >
              Xóa lọc tìm kiếm
            </button>
          )}
        </div>

        <label
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs font-medium text-white/90 cursor-pointer hover:border-white/40 transition"
          htmlFor={`${formId}-pet-friendly`}
        >
          <Controller
            control={control}
            name="petFriendly"
            render={({ field }) => (
              <Switch
                id={`${formId}-pet-friendly`}
                size="small"
                checked={field.value}
                onChange={(checked) => {
                  field.onChange(checked)
                  onSearchSubmit({
                    destination: destinationValue,
                    checkIn: checkInValue,
                    checkOut: checkOutValue,
                    guests: guestsValue,
                    rooms: roomsValue,
                    petFriendly: checked,
                  })
                }}
              />
            )}
          />
          <span>Mang theo thú cưng</span>
        </label>
      </div>
    </div>
  )
}
