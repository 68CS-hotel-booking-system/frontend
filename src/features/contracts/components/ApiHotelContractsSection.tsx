import { useId, useRef, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App as AntApp, Button, Form, Input, InputNumber, Pagination, Popconfirm } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { useCurrentUser } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'
import {
  useApiHotelContractsQuery,
  useChangeContractStatus,
  useCreateApiHotelContractMutation,
} from '../hooks/use-api-hotel-contracts'
import { type ContractStatus } from '../model/contract'
import { createApiContractFormSchema, type CreateApiContractFormValues } from '../model/contract-api-contract'

export interface OwnerBasicInfo {
  fullName: string
  email?: string
  phone?: string
}

interface Props {
  hotelId: string
  hotelName?: string
  ownerUserId?: string
  owner?: OwnerBasicInfo | null
  ownerLoading?: boolean
  onViewOwner?: () => void
}

const basisLabels = {
  BEFORE_DISCOUNT: 'Trước giảm giá',
  AFTER_DISCOUNT: 'Sau giảm giá',
  AFTER_HOTEL_DISCOUNT: 'Sau giảm giá của khách sạn',
} as const

const statusLabels: Record<ContractStatus, string> = {
  DRAFT: 'Dự thảo',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hiệu lực',
  TERMINATED: 'Đã chấm dứt',
}

const statusTabs: { value: ContractStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hiệu lực' },
  { value: 'DRAFT', label: 'Dự thảo' },
  { value: 'EXPIRED', label: 'Hết hiệu lực' },
  { value: 'TERMINATED', label: 'Đã chấm dứt' },
]

function getStatusPresentation(status: ContractStatus, startsAt: string, nowMs: number) {
  const notYetEffective = status === 'ACTIVE' && Date.parse(startsAt) > nowMs
  if (notYetEffective) {
    return {
      label: 'Chưa đến ngày hiệu lực',
      pillClass: 'bg-[#eef8f5] text-[#0b5f53] border-[#cde5dd]',
      accentBorderClass: 'border-l-[#0b5f53]',
      icon: <ClockCircleOutlined aria-hidden="true" />,
    }
  }

  switch (status) {
    case 'ACTIVE':
      return {
        label: statusLabels.ACTIVE,
        pillClass: 'bg-[#eaf6f1] text-[#0f7a5f] border-[#cde9dc]',
        accentBorderClass: 'border-l-[#0f7a5f]',
        icon: <CheckCircleOutlined aria-hidden="true" />,
      }
    case 'DRAFT':
      return {
        label: statusLabels.DRAFT,
        pillClass: 'bg-[#fff8e6] text-[#946412] border-[#f5deb3]',
        accentBorderClass: 'border-l-[#946412]',
        icon: <EditOutlined aria-hidden="true" />,
      }
    case 'EXPIRED':
      return {
        label: statusLabels.EXPIRED,
        pillClass: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
        accentBorderClass: 'border-l-[#94a3b8]',
        icon: <HistoryOutlined aria-hidden="true" />,
      }
    case 'TERMINATED':
      return {
        label: statusLabels.TERMINATED,
        pillClass: 'bg-[#fdecea] text-[#9b2c22] border-[#f5c2c7]',
        accentBorderClass: 'border-l-[#9b2c22]',
        icon: <StopOutlined aria-hidden="true" />,
      }
  }
}

export function ApiHotelContractsSection({
  hotelId,
  hotelName,
  ownerUserId = '',
  owner,
  ownerLoading = false,
  onViewOwner,
}: Props) {
  const formId = useId()
  const formPanel = useRef<HTMLElement>(null)
  const submitting = useRef(false)
  const { message } = AntApp.useApp()
  const { isAdmin } = useCurrentUser()
  const [renewingCode, setRenewingCode] = useState<string>()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [status, setStatus] = useState<ContractStatus | undefined>()
  const query = useApiHotelContractsQuery(hotelId, { page, size, status })
  const mutation = useCreateApiHotelContractMutation(hotelId)
  const lifecycle = useChangeContractStatus(hotelId)
  const busy = mutation.isPending || lifecycle.isPending

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateApiContractFormValues>({
    resolver: zodResolver(createApiContractFormSchema),
    defaultValues: {
      ownerUserId,
      commissionRate: 12,
      commissionBasis: 'AFTER_DISCOUNT',
      startsAt: '',
      endsAt: '',
    },
  })

  async function submit(values: CreateApiContractFormValues) {
    if (!isAdmin || submitting.current || busy) return
    submitting.current = true
    try {
      const created = await mutation.mutateAsync(values)
      void message.success(`Đã tạo dự thảo hợp đồng "${created.contractCode}".`)
      reset({ ...values, renewalOfContractId: undefined })
      setRenewingCode(undefined)
      setPage(0)
      setStatus(undefined)
    } catch (error) {
      applyApiFieldErrors(error, setError)
    } finally {
      submitting.current = false
    }
  }

  async function changeStatus(id: string, action: 'activate' | 'terminate') {
    if (busy) return
    try {
      await lifecycle.mutateAsync({ id, action })
      void message.success(action === 'activate' ? 'Đã kích hoạt hợp đồng.' : 'Đã chấm dứt hợp đồng.')
    } catch {
      /* Lỗi được hiển thị dưới danh sách để có thể thử lại. */
    }
  }

  function handleCancelRenew() {
    setRenewingCode(undefined)
    mutation.reset()
    reset({
      ownerUserId,
      commissionRate: 12,
      commissionBasis: 'AFTER_DISCOUNT',
      startsAt: '',
      endsAt: '',
      renewalOfContractId: undefined,
    })
  }

  return (
    <div
      className={
        isAdmin
          ? 'detail-grid-layout grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6 items-start'
          : 'space-y-6'
      }
    >
      {/* Cột trái: Danh sách thỏa thuận & hợp đồng */}
      <section
        className="min-w-0 bg-white border border-[#dce7e3] rounded-2xl overflow-hidden shadow-2xs"
        aria-labelledby={`${formId}-list`}
      >
        <div className="p-5 sm:p-6 border-b border-[#eef4f1] flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={`${formId}-list`} className="text-lg font-bold text-[#12211d] m-0">
                  Thỏa thuận &amp; Hợp đồng hoa hồng
                </h2>
                {hotelName && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef8f5] text-[#0b5f53] border border-[#cde5dd]">
                    {hotelName}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#5f736e] mt-1 mb-0">
                Danh sách thỏa thuận từ hệ thống tài chính.
              </p>
            </div>
            <Button
              icon={<ReloadOutlined aria-hidden="true" />}
              loading={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Tải lại
            </Button>
          </div>

          {query.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7fbfa] border border-[#e6f0ec] px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#5f736e]">Tổng thỏa thuận khớp bộ lọc</span>
                <strong className="text-base font-bold text-[#12211d] tabular-nums">
                  {query.data.totalElements} hợp đồng
                </strong>
              </div>
              <div className="rounded-xl bg-[#f7fbfa] border border-[#e6f0ec] px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#5f736e]">Đang hiển thị</span>
                <strong className="text-base font-bold text-[#0b5f53] tabular-nums">
                  {query.data.content.length} · Trang {query.data.page + 1}
                </strong>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="rounded-xl bg-[#f7fbfa] border border-[#dce7e3] px-4 py-3 text-sm text-[#344a44]">
              Bạn có thể tra cứu điều khoản và thời hạn tại đây. Việc tạo, gia hạn và kích hoạt hợp đồng do quản trị viên thực hiện.
            </div>
          )}
        </div>

        {/* Thanh lọc trạng thái nhanh dạng tab ngang */}
        <div className="px-5 sm:px-6 border-b border-[#eef4f1] overflow-x-auto">
          <div
            role="tablist"
            aria-label="Lọc theo trạng thái hợp đồng"
            className="flex items-center gap-5 min-w-max"
          >
            {statusTabs.map((tab) => {
              const selected = (status ?? 'ALL') === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setStatus(tab.value === 'ALL' ? undefined : tab.value)
                    setPage(0)
                  }}
                  className={`py-3 text-sm border-0 border-b-2 bg-transparent cursor-pointer whitespace-nowrap transition-colors ${
                    selected
                      ? 'border-[#0b5f53] text-[#0b5f53] font-semibold'
                      : 'border-transparent text-[#5f736e] hover:text-[#12211d] font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nội dung danh sách */}
        <div className="p-5 sm:p-6 space-y-4">
          {query.isPending ? (
            <PageLoading />
          ) : query.isError ? (
            <Alert
              type="error"
              showIcon
              title="Chưa tải được danh sách hợp đồng"
              description={errorMessage(query.error)}
              action={
                <Button loading={query.isFetching} onClick={() => void query.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : query.data.content.length === 0 ? (
            <EmptyState title="Không có hợp đồng hoa hồng phù hợp" />
          ) : (
            <div className="space-y-3.5" role="list">
              {query.data.content.map((contract) => {
                const presentation = getStatusPresentation(contract.status, contract.startsAt, query.dataUpdatedAt)
                return (
                  <article
                    key={contract.id}
                    role="listitem"
                    className={`rounded-xl border border-[#dce7e3] border-l-[3px] ${presentation.accentBorderClass} bg-white p-4 sm:p-5 hover:border-[#bfd3cd] transition-colors space-y-3.5`}
                  >
                    {/* Hàng đầu: Mã hợp đồng + Tỷ lệ hoa hồng + Trạng thái */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileTextOutlined className="text-[#0b5f53] shrink-0" aria-hidden="true" />
                        <span className="font-mono text-sm sm:text-[15px] font-semibold text-[#12211d] break-all">
                          {contract.contractCode}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eef8f5] text-[#0b5f53] border border-[#cde5dd] tabular-nums">
                          Hoa hồng: {contract.commissionRate}%
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${presentation.pillClass}`}
                        >
                          {presentation.icon}
                          <span>{presentation.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Hàng giữa: Cơ sở tính & Khung thời gian hiệu lực */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[#f7fbfa] border border-[#e6f0ec] p-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f736e]">
                          Cơ sở tính hoa hồng
                        </span>
                        <span className="text-sm font-semibold text-[#12211d]">
                          {basisLabels[contract.commissionBasis]}
                        </span>
                        <span className="text-xs text-[#5f736e]">
                          Tạo lúc: {new Date(contract.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f736e] inline-flex items-center gap-1.5">
                          <CalendarOutlined aria-hidden="true" />
                          <span>Thời gian hiệu lực</span>
                        </span>
                        <span className="text-sm font-medium text-[#12211d] tabular-nums">
                          {new Date(contract.startsAt).toLocaleString('vi-VN')} →{' '}
                          {new Date(contract.endsAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {contract.commissionBasis !== 'AFTER_DISCOUNT' && (
                      <Alert
                        type="warning"
                        showIcon
                        title="Hợp đồng này dùng cách tính cũ"
                        description="Cần hợp đồng tính hoa hồng trên tiền phòng sau giảm giá để nhận đặt phòng mới."
                      />
                    )}

                    {/* Hàng đáy: Hành động quản trị */}
                    {isAdmin && (
                      <div className="pt-3 border-t border-[#eef4f1] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {contract.status === 'DRAFT' && (
                            <Popconfirm
                              title="Kích hoạt hợp đồng này?"
                              description="Khách sạn có thể nhận đặt phòng khi hợp đồng có hiệu lực và đủ điều kiện mở bán."
                              okText="Kích hoạt"
                              cancelText="Quay lại"
                              onConfirm={() => changeStatus(contract.id, 'activate')}
                            >
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined aria-hidden="true" />}
                                disabled={busy}
                              >
                                Kích hoạt hợp đồng
                              </Button>
                            </Popconfirm>
                          )}
                          {contract.status !== 'DRAFT' && (
                            <Button
                              icon={<SyncOutlined aria-hidden="true" />}
                              disabled={busy}
                              onClick={() => {
                                const start = new Date(
                                  Math.ceil(Math.max(Date.parse(contract.endsAt), Date.now()) / 1000) * 1000,
                                )
                                const end = new Date(start)
                                end.setFullYear(end.getFullYear() + 1)
                                const local = (date: Date) =>
                                  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                    .toISOString()
                                    .slice(0, 19)
                                reset({
                                  ownerUserId,
                                  commissionRate: contract.commissionRate,
                                  commissionBasis: 'AFTER_DISCOUNT',
                                  startsAt: local(start),
                                  endsAt: local(end),
                                  renewalOfContractId: contract.id,
                                })
                                setRenewingCode(contract.contractCode)
                                mutation.reset()
                                requestAnimationFrame(() => {
                                  formPanel.current?.scrollIntoView({
                                    block: 'start',
                                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                                      ? 'instant'
                                      : 'smooth',
                                  })
                                  formPanel.current
                                    ?.querySelector<HTMLInputElement>('input:not([type="hidden"])')
                                    ?.focus({ preventScroll: true })
                                })
                              }}
                            >
                              Gia hạn
                            </Button>
                          )}
                        </div>

                        {['DRAFT', 'ACTIVE'].includes(contract.status) && (
                          <Popconfirm
                            title="Chấm dứt hợp đồng này?"
                            description="Khách sạn ngừng nhận đơn mới nếu không có hợp đồng hiệu lực khác. Các đơn đã tạo được giữ nguyên."
                            okText="Chấm dứt"
                            cancelText="Quay lại"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => changeStatus(contract.id, 'terminate')}
                          >
                            <Button danger icon={<StopOutlined aria-hidden="true" />} disabled={busy}>
                              Chấm dứt hợp đồng
                            </Button>
                          </Popconfirm>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {lifecycle.isError && (
            <Alert
              type="error"
              showIcon
              title="Không thể cập nhật hợp đồng"
              description={errorMessage(lifecycle.error)}
            />
          )}

          {query.data && query.data.totalElements > 0 && (
            <div className="pt-2 flex justify-end">
              <Pagination
                current={page + 1}
                pageSize={size}
                total={query.data.totalElements}
                showSizeChanger
                onChange={(next, nextSize) => {
                  setPage(nextSize === size ? next - 1 : 0)
                  setSize(nextSize)
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Cột phải (ADMIN only): Sticky Form Tạo dự thảo / Gia hạn */}
      {isAdmin && (
        <aside
          ref={formPanel}
          className="min-w-0 xl:sticky xl:top-[84px] bg-white border border-[#dce7e3] rounded-2xl p-5 sm:p-6 shadow-2xs scroll-mt-24 space-y-4"
          aria-labelledby={`${formId}-create`}
        >
          {renewingCode && (
            <div className="rounded-xl bg-[#eef8f5] border border-[#bcd8cf] px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-medium text-[#08473e]">
              <span className="truncate">
                Đang gia hạn từ <strong className="font-mono">{renewingCode}</strong>
              </span>
              <button
                type="button"
                onClick={handleCancelRenew}
                disabled={busy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b5f53] hover:text-[#08473e] bg-transparent border-0 p-0 cursor-pointer shrink-0"
              >
                <CloseOutlined className="text-[10px]" aria-hidden="true" />
                <span>Hủy</span>
              </button>
            </div>
          )}

          <div>
            <h2 id={`${formId}-create`} className="text-lg font-bold text-[#12211d] m-0">
              {renewingCode ? `Gia hạn từ ${renewingCode}` : 'Tạo dự thảo hợp đồng hoa hồng'}
            </h2>
            <p className="text-xs text-[#5f736e] mt-1.5 mb-0 leading-relaxed">
              Hoa hồng tính cố định trên tiền phòng sau giảm giá. Thời gian hiển thị theo múi giờ thiết bị.
              {' '}Mã hợp đồng được tạo tự động sau khi lưu.
            </p>
          </div>

          {!ownerUserId && (
            <Alert
              type="warning"
              showIcon
              title="Chưa xác định được chủ khách sạn. Vui lòng tải lại thông tin khách sạn."
            />
          )}

          {mutation.isError && (
            <Alert
              type="error"
              showIcon
              title="Không thể tạo hợp đồng"
              description={errorMessage(mutation.error)}
            />
          )}

          <Form
            layout="vertical"
            component="form"
            className="admin-form"
            noValidate
            disabled={busy || !ownerUserId}
            onSubmitCapture={(event) => void handleSubmit(submit)(event)}
          >
            <Form.Item
              label="Chủ sở hữu"
              validateStatus={errors.ownerUserId ? 'error' : undefined}
              help={errors.ownerUserId?.message}
            >
              {owner && onViewOwner ? (
                <button
                  type="button"
                  onClick={onViewOwner}
                  disabled={false}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#f7fbfa] border border-[#dce7e3] hover:border-[#0b5f53] hover:bg-[#eef8f5] transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-[#d9f0ea] text-[#08473e] flex items-center justify-center shrink-0">
                      <UserOutlined aria-hidden="true" />
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[#12211d] truncate">
                        {owner.fullName}
                      </span>
                      {owner.email && (
                        <span className="text-xs text-[#5f736e] truncate">{owner.email}</span>
                      )}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-[#0b5f53] shrink-0">
                    Xem thông tin
                  </span>
                </button>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-[#f7fbfa] border border-[#dce7e3] text-sm text-[#344a44]">
                  {ownerLoading
                    ? 'Đang tải thông tin chủ sở hữu…'
                    : 'Chủ sở hữu hiện tại của khách sạn'}
                </div>
              )}
              <input type="hidden" value={ownerUserId} readOnly />
            </Form.Item>

            <Form.Item
              label="Tỷ lệ hoa hồng (%)"
              htmlFor={`${formId}-rate`}
              required
              validateStatus={errors.commissionRate ? 'error' : undefined}
              help={
                errors.commissionRate?.message ??
                'Căn cứ: tiền phòng sau giảm giá. Phụ thu được giữ trong khoản owner được hưởng.'
              }
            >
              <Controller
                name="commissionRate"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    id={`${formId}-rate`}
                    className="w-full"
                    size="large"
                    min={0}
                    max={100}
                    step={0.01}
                    suffix="%"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Hiệu lực từ thời điểm"
              htmlFor={`${formId}-start`}
              required
              validateStatus={errors.startsAt ? 'error' : undefined}
              help={errors.startsAt?.message}
            >
              <Controller
                name="startsAt"
                control={control}
                render={({ field }) => (
                  <Input {...field} id={`${formId}-start`} type="datetime-local" step={1} size="large" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Hiệu lực đến thời điểm"
              htmlFor={`${formId}-end`}
              required
              validateStatus={errors.endsAt ? 'error' : undefined}
              help={errors.endsAt?.message}
            >
              <Controller
                name="endsAt"
                control={control}
                render={({ field }) => (
                  <Input {...field} id={`${formId}-end`} type="datetime-local" step={1} size="large" />
                )}
              />
            </Form.Item>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full !h-11 !rounded-xl !bg-[#0b5f53] hover:!bg-[#08473e] font-semibold"
                icon={<PlusOutlined aria-hidden="true" />}
                loading={mutation.isPending}
                disabled={busy || !ownerUserId}
              >
                {renewingCode ? 'Tạo dự thảo gia hạn' : 'Tạo dự thảo hợp đồng'}
              </Button>
              {renewingCode && (
                <Button className="w-full" disabled={busy} onClick={handleCancelRenew}>
                  Hủy gia hạn
                </Button>
              )}
            </div>
          </Form>
        </aside>
      )}
    </div>
  )
}
