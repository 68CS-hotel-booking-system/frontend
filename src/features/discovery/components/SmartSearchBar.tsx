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
import { z } from 'zod'
import { QUICK_LOCATION_SUGGESTIONS } from '@/features/discovery/data/stayvibe-mock-data'

const smartSearchSchema = z
  .object({
    destination: z.string().trim().max(120),
    checkIn: z.string().min(1, 'Chọn ngày nhận phòng'),
    checkOut: z.string().min(1, 'Chọn ngày trả phòng'),
    guests: z.number().int().min(1).max(16),
    rooms: z.number().int().min(1).max(8),
    petFriendly: z.boolean(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Ngày trả phòng phải sau ngày nhận phòng',
    path: ['checkOut'],
  })

export type SmartSearchFormValues = z.infer<typeof smartSearchSchema>

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
    <div className="smart-search-wrapper">
      <form
        className={`smart-search-bar glass-floating-bar ${
          activeSegment ? 'has-active-segment' : ''
        }`}
        onSubmit={(event) => void handleSubmit(onSearchSubmit)(event)}
        noValidate
        aria-label="Thanh tìm kiếm thông minh StayVibe"
      >
        {/* Phân vùng 1: Địa điểm */}
        <div
          className={`smart-search-segment ${
            activeSegment === 'location' ? 'is-focused' : ''
          }`}
          onFocus={() => setActiveSegment('location')}
        >
          <div className="smart-search-segment__icon" aria-hidden="true">
            <EnvironmentOutlined />
          </div>
          <div className="smart-search-segment__body">
            <label
              htmlFor={`${formId}-destination`}
              className="smart-search-segment__label"
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
                  className="smart-search-input"
                  placeholder="Đà Lạt, Phú Quốc, Hội An hoặc tên chỗ nghỉ..."
                  autoComplete="off"
                />
              )}
            />
          </div>
        </div>

        {/* Phân vùng 2: Ngày nhận - trả phòng */}
        <div
          className={`smart-search-segment ${
            activeSegment === 'dates' ? 'is-focused' : ''
          }`}
          onFocus={() => setActiveSegment('dates')}
        >
          <div className="smart-search-segment__icon" aria-hidden="true">
            <CalendarOutlined />
          </div>
          <div className="smart-search-segment__body">
            <div className="smart-search-segment__label-row">
              <label
                htmlFor={`${formId}-checkin`}
                className="smart-search-segment__label"
              >
                Nhận — Trả phòng
              </label>
              <span className="nights-pill-badge">{totalNights} đêm</span>
            </div>
            <div className="smart-search-dates-row">
              <Controller
                control={control}
                name="checkIn"
                render={({ field }) => (
                  <input
                    {...field}
                    id={`${formId}-checkin`}
                    type="date"
                    aria-label="Ngày nhận phòng"
                    className="smart-search-date-input"
                  />
                )}
              />
              <span className="date-arrow-sep" aria-hidden="true">
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
                    className="smart-search-date-input"
                  />
                )}
              />
            </div>
            {errors.checkOut && (
              <span className="smart-search-error" role="alert">
                {errors.checkOut.message}
              </span>
            )}
          </div>
        </div>

        {/* Phân vùng 3: Số lượng khách & phòng */}
        <div
          className={`smart-search-segment ${
            activeSegment === 'guests' ? 'is-focused' : ''
          }`}
          onFocus={() => setActiveSegment('guests')}
        >
          <div className="smart-search-segment__icon" aria-hidden="true">
            <TeamOutlined />
          </div>
          <div className="smart-search-segment__body">
            <span className="smart-search-segment__label">Khách &amp; Phòng</span>
            <div className="smart-search-counters-row">
              <div className="guest-stepper" aria-label="Số lượng khách">
                <button
                  type="button"
                  className="stepper-circle-btn"
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
                <span className="stepper-value">{guestsValue} khách</span>
                <button
                  type="button"
                  className="stepper-circle-btn"
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

              <span className="dot-sep" aria-hidden="true">
                ·
              </span>

              <div className="guest-stepper" aria-label="Số lượng phòng">
                <button
                  type="button"
                  className="stepper-circle-btn"
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
                <span className="stepper-value">{roomsValue} phòng</span>
                <button
                  type="button"
                  className="stepper-circle-btn"
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
        <div className="smart-search-cta-zone">
          <button type="submit" className="btn-sunset-explore">
            <SearchOutlined aria-hidden="true" />
            <span>Khám phá</span>
          </button>
        </div>
      </form>

      {/* Thanh phụ dưới Search Bar: Gợi ý điểm đến nhanh + Toggle thú cưng */}
      <div className="smart-search-subbar">
        <div className="quick-destinations-group">
          <span className="quick-destinations-label">Điểm đến xu hướng:</span>
          {QUICK_LOCATION_SUGGESTIONS.map((city) => {
            const isSelected =
              destinationValue.toLowerCase() === city.toLowerCase()
            return (
              <button
                key={city}
                type="button"
                className={`quick-dest-pill ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleQuickSelectCity(city)}
              >
                {city}
              </button>
            )
          })}
          {(destinationValue || petFriendlyValue) && (
            <button
              type="button"
              className="quick-dest-clear-btn"
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

        <label className="pet-toggle-pill" htmlFor={`${formId}-pet-friendly`}>
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

