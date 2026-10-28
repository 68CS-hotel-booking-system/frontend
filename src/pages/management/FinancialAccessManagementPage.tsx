import { useState } from 'react'
import {
  BankOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  StarFilled,
} from '@ant-design/icons'
import { Button, Select, Space, Tag } from 'antd'
import { useNavigate, useSearchParams } from 'react-router'
import { useHotelContractsQuery } from '@/features/contracts/hooks/use-hotel-contracts'
import { FinancialAccessSection } from '@/features/finance/components/FinancialAccessSection'
import { HotelStatusBadge } from '@/features/hotels/components/HotelStatusBadge'
import {
  useManagementHotelDetailQuery,
  useManagementHotelsQuery,
} from '@/features/hotels/hooks/use-hotel-management'
import { DataSourceBanner } from '@/shared/ui/DataSourceBanner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'

export function FinancialAccessManagementPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryHotelId = searchParams.get('hotelId') ?? ''
  const [selectedHotelId, setSelectedHotelId] = useState(queryHotelId)

  const hotelsListQuery = useManagementHotelsQuery({ page: 0, size: 20 })
  const hotels = hotelsListQuery.data?.content ?? []

  const activeHotelId =
    hotels.some((h) => h.id === selectedHotelId)
      ? selectedHotelId
      : (hotels[0]?.id ?? '')

  const hotelDetailQuery = useManagementHotelDetailQuery(activeHotelId)
  const contractsQuery = useHotelContractsQuery(activeHotelId)

  function handleSelectHotel(nextHotelId: string) {
    setSelectedHotelId(nextHotelId)
    setSearchParams({ hotelId: nextHotelId })
  }

  return (
    <div className="management-page rates-management-page">
      <DataSourceBanner />

      {/* 1. Header trang tinh gọn, sang trọng */}
      <header className="rates-page-header">
        <div className="rates-page-header__content">
          <span className="rates-page-header__kicker">
            <SafetyCertificateOutlined aria-hidden="true" /> PHÂN QUYỀN TÀI CHÍNH ĐỐI TÁC
          </span>
          <h1 className="rates-page-header__title">
            Cấp &amp; Thu hồi Quyền Đọc Tài chính
          </h1>
          <p className="rates-page-header__desc">
            Quản lý quyền đọc hợp đồng hoa hồng, đối soát thanh toán và xuất báo
            cáo tài chính cho từng đại diện khách sạn.
          </p>
        </div>

        <div className="rates-page-header__actions">
          {activeHotelId && (
            <>
              <Button
                icon={<FileProtectOutlined aria-hidden="true" />}
                onClick={() =>
                  void navigate(`/management/contracts?hotelId=${activeHotelId}`)
                }
              >
                Xem hợp đồng
              </Button>
              <Button
                icon={<SettingOutlined aria-hidden="true" />}
                onClick={() =>
                  void navigate(`/management/hotels/${activeHotelId}?tab=general`)
                }
              >
                Hồ sơ khách sạn
              </Button>
            </>
          )}
          <Button
            icon={<BankOutlined aria-hidden="true" />}
            onClick={() => void navigate('/management/hotels')}
          >
            Danh sách khách sạn
          </Button>
        </div>
      </header>

      {hotelsListQuery.isPending ? (
        <PageLoading />
      ) : hotelsListQuery.isError ? (
        <div className="surface-card">
          <ErrorState
            error={hotelsListQuery.error}
            retrying={hotelsListQuery.isFetching}
            onRetry={() => void hotelsListQuery.refetch()}
          />
        </div>
      ) : hotels.length === 0 ? (
        <div className="surface-card">
          <EmptyState
            title="Chưa có khách sạn nào trong danh sách vận hành"
            description="Vui lòng tạo khách sạn mới trước khi phân quyền đọc tài chính."
            action={
              <Button
                type="primary"
                onClick={() => void navigate('/management/hotels')}
              >
                Đến Quản trị khách sạn
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {/* 2. Thanh chọn cơ sở lưu trú liền mạch */}
          <section
            className="rates-hotel-strip"
            aria-label="Chọn khách sạn cần cấp quyền tài chính"
          >
            <div className="rates-hotel-strip__selector">
              <label htmlFor="financial-access-hotel-switcher" className="rates-hotel-strip__label">
                Cơ sở lưu trú:
              </label>
              <Select
                id="financial-access-hotel-switcher"
                value={activeHotelId}
                onChange={handleSelectHotel}
                className="rates-hotel-strip__select"
                size="large"
                options={hotels.map((h) => ({
                  label: `${h.name} — ${h.cityName ?? 'Việt Nam'} (Chủ sở hữu: ${h.ownerName ?? 'Đối tác'})`,
                  value: h.id,
                }))}
              />
            </div>

            {hotelDetailQuery.data && (
              <div className="rates-hotel-strip__meta">
                <Space wrap size={8}>
                  <HotelStatusBadge status={hotelDetailQuery.data.status} />
                  {hotelDetailQuery.data.starRating && (
                    <Tag color="gold">
                      <StarFilled aria-hidden="true" />{' '}
                      {hotelDetailQuery.data.starRating} Sao
                    </Tag>
                  )}
                  <Tag color="blue">
                    <EnvironmentOutlined aria-hidden="true" />{' '}
                    {hotelDetailQuery.data.cityName}
                  </Tag>
                  <Tag color="purple">
                    Chủ sở hữu: {hotelDetailQuery.data.ownerName ?? 'Đối tác'}
                  </Tag>
                </Space>
              </div>
            )}
          </section>

          {/* 3. Phân quyền tài chính cho cơ sở được chọn */}
          {hotelDetailQuery.isPending ? (
            <PageLoading />
          ) : hotelDetailQuery.isError ? (
            <div className="surface-card">
              <ErrorState
                error={hotelDetailQuery.error}
                retrying={hotelDetailQuery.isFetching}
                onRetry={() => void hotelDetailQuery.refetch()}
              />
            </div>
          ) : (
            <FinancialAccessSection
              key={`fin-access-${hotelDetailQuery.data.id}`}
              hotelId={hotelDetailQuery.data.id}
              hotelName={hotelDetailQuery.data.name}
              defaultOwnerUserId={hotelDetailQuery.data.ownerUserId}
              contracts={contractsQuery.data ?? []}
            />
          )}
        </>
      )}
    </div>
  )
}
