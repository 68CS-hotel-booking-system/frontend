import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  clientSearchSchema,
  type ClientSearchFormValues,
} from '../model/client-search-schema'
import { CLIENT_PROOFS, CLIENT_QUICK_CITIES } from '../mocks/client-home-data'
import { localDate } from '@/features/bookings'
import { ClientIcon } from './ClientSiteIcons'

interface ClientHeroSectionProps {
  onSearchSubmit: (values: ClientSearchFormValues) => void
  onQuickCity: (city: string) => void
  onOpenStay: (id: string) => void
  compact?: boolean
  initialValues?: Partial<ClientSearchFormValues>
  cities?: string[]
}

export function ClientHeroSection({
  onSearchSubmit,
  onQuickCity,
  onOpenStay,
  compact = false,
  initialValues,
  cities = CLIENT_QUICK_CITIES,
}: ClientHeroSectionProps) {
  const form = useForm<ClientSearchFormValues>({
    resolver: zodResolver(clientSearchSchema),
    resetOptions: { keepDirtyValues: true },
    values: {
      destination: '',
      checkIn: localDate().split('-').reverse().join('/'),
      checkOut: localDate(1).split('-').reverse().join('/'),
      guests: '2 khách · 1 phòng',
      ...initialValues,
    },
  })
  const { register, handleSubmit, formState: { errors, dirtyFields } } = form
  void dirtyFields

  return (
    <section
      className={`hero${compact ? ' hero--search' : ''}`}
      id="top"
      data-od-id="hero-section"
      aria-labelledby="hero-title"
    >
      <div className="container">
        {compact ? <div className="search-page-heading"><h1 id="hero-title">Tìm nơi <em>bạn muốn ở.</em></h1><p>Chọn điểm đến và kỳ nghỉ để khám phá các chỗ nghỉ đang mở bán.</p></div> : <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Bộ sưu tập mùa thu 2026</p>
            <h1 id="hero-title" data-od-id="hero-title">
              Ở nơi <em>câu chuyện</em>
              <br />
              bắt đầu.
            </h1>
            <p className="hero-lede">
              Những chỗ nghỉ có gu, được chọn vì ánh sáng, vị trí và cảm giác khi
              bạn mở cửa bước vào. Để mỗi chuyến đi không chỉ là một đêm ngủ.
            </p>
            <div className="hero-meta" aria-label="Thông tin bộ sưu tập">
              <div>
                <strong>128</strong>
                <span>chỗ nghỉ tuyển chọn</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>điểm trung bình</span>
              </div>
              <div>
                <strong>24</strong>
                <span>tỉnh thành</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <figure className="hero-media">
              <img
                src="/assets/client/phuquoc.jpg"
                alt="Khu nghỉ dưỡng ven biển với hồ bơi vô cực nhìn ra đại dương"
                fetchPriority="high"
                width="1400"
                height="1400"
              />
              <span className="hero-location">
                <ClientIcon name="pin" /> Phú Quốc · Việt Nam
              </span>
              <span className="hero-coord">10°17′N &nbsp; 103°58′E</span>
            </figure>

            <div className="hero-float">
              <small>Gợi ý hôm nay</small>
              <strong>An Nhiên Beach House</strong>
              <p>
                Phú Quốc · từ <strong className="hero-price">2.450.000₫</strong> / đêm
              </p>
              <button
                type="button"
                data-open="an-nhien"
                onClick={() => onOpenStay('an-nhien')}
              >
                Xem chi tiết <ClientIcon name="arrow" />
              </button>
            </div>
          </div>
        </div>}

        <div className="search-wrap">
          <form
            className="search-panel"
            id="search-form"
            data-od-id="search-panel"
            aria-label="Tìm kiếm chỗ nghỉ"
            onSubmit={handleSubmit(onSearchSubmit)}
          >
            <div className="search-field">
              <ClientIcon name="pin" />
              <div className="search-field-content">
                <label htmlFor="destination">Điểm đến</label>
                <input
                  id="destination"
                  type="text"
                  list="destination-list"
                  placeholder="Bạn muốn đi đâu?"
                  autoComplete="off"
                  {...register('destination')}
                />
                <datalist id="destination-list">
                  {cities.map((city) => <option value={city} key={city} />)}
                </datalist>
              </div>
            </div>

            <div className="search-field">
              <ClientIcon name="calendar" />
              <div className="search-field-content">
                <label htmlFor="check-in">Nhận phòng</label>
                <input
                  id="check-in"
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  aria-label="Ngày nhận phòng, định dạng ngày trên tháng trên năm"
                  {...register('checkIn')}
                />
              </div>
            </div>

            <div className="search-field">
              <ClientIcon name="calendar" />
              <div className="search-field-content">
                <label htmlFor="check-out">Trả phòng</label>
                <input
                  id="check-out"
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  aria-label="Ngày trả phòng, định dạng ngày trên tháng trên năm"
                  {...register('checkOut')}
                />
              </div>
            </div>

            <div className="search-field">
              <ClientIcon name="users" />
              <div className="search-field-content">
                <label htmlFor="guests">Khách &amp; phòng</label>
                <select id="guests" {...register('guests')}>
                  {initialValues?.guests && !['2 khách · 1 phòng', '1 khách · 1 phòng', '2 khách · 2 phòng', '4 khách · 2 phòng'].includes(initialValues.guests) && <option value={initialValues.guests}>{initialValues.guests}</option>}
                  <option value="2 khách · 1 phòng">2 khách · 1 phòng</option>
                  <option value="1 khách · 1 phòng">1 khách · 1 phòng</option>
                  <option value="2 khách · 2 phòng">2 khách · 2 phòng</option>
                  <option value="4 khách · 2 phòng">4 khách · 2 phòng</option>
                </select>
              </div>
            </div>

            <button
              className="search-submit"
              type="submit"
              data-od-id="search-submit-btn"
              aria-label="Tìm kiếm chỗ nghỉ"
            >
              <ClientIcon name="search" />
              <span>Tìm chỗ nghỉ</span>
            </button>
          </form>
          {Object.values(errors).length > 0 && <p role="alert" className="stay-field-error">{Object.values(errors)[0]?.message}</p>}

          <div className="search-hints">
            <div className="quick-row">
              <span>Tìm nhanh</span>
              {cities.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  data-quick={city}
                  onClick={() => onQuickCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
            {!compact && <span className="search-promise">
              <ClientIcon name="check" /> Hủy linh hoạt trong 48 giờ
            </span>}
          </div>
        </div>

        {!compact && <div className="proof-strip" data-od-id="proof-strip" aria-label="Cam kết của StayHub">
          {CLIENT_PROOFS.map((proof) => (
            <div key={proof.label} className="proof-item">
              <strong>{proof.value}</strong>
              <span>{proof.label}</span>
            </div>
          ))}
        </div>}
      </div>
    </section>
  )
}
