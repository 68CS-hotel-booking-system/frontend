import { useId, useRef, useState } from 'react'
import { PlusOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App as AntApp, Button, Form, Input, InputNumber, Pagination, Popconfirm, Select, Space, Tag } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { useCurrentUser } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { useApiHotelContractsQuery, useChangeContractStatus, useCreateApiHotelContractMutation } from '../hooks/use-api-hotel-contracts'
import { contractStatusValues, type ContractStatus } from '../model/contract'
import { createApiContractFormSchema, type CreateApiContractFormValues } from '../model/contract-api-contract'

interface Props { hotelId: string; hotelName?: string; ownerUserId?: string }
const basisLabels = { BEFORE_DISCOUNT: 'Trước giảm giá', AFTER_DISCOUNT: 'Sau giảm giá', AFTER_HOTEL_DISCOUNT: 'Sau giảm giá của khách sạn' }
const statusLabels = { DRAFT: 'Dự thảo', ACTIVE: 'Đang hiệu lực', EXPIRED: 'Hết hiệu lực', TERMINATED: 'Đã chấm dứt' }

export function ApiHotelContractsSection({ hotelId, hotelName, ownerUserId = '' }: Props) {
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
  const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<CreateApiContractFormValues>({
    resolver: zodResolver(createApiContractFormSchema),
    defaultValues: { contractCode: '', ownerUserId, commissionRate: 12, commissionBasis: 'AFTER_DISCOUNT', startsAt: '', endsAt: '' },
  })

  async function submit(values: CreateApiContractFormValues) {
    if (!isAdmin || submitting.current || busy) return
    submitting.current = true
    try {
      const created = await mutation.mutateAsync(values)
      void message.success(`Đã tạo dự thảo hợp đồng "${created.contractCode}".`)
      reset({ ...values, contractCode: '', renewalOfContractId: undefined })
      setRenewingCode(undefined)
      setPage(0)
      setStatus(undefined)
    } catch (error) { applyApiFieldErrors(error, setError) } finally { submitting.current = false }
  }

  async function changeStatus(id: string, action: 'activate' | 'terminate') {
    if (busy) return
    try {
      await lifecycle.mutateAsync({ id, action })
      void message.success(action === 'activate' ? 'Đã kích hoạt hợp đồng.' : 'Đã chấm dứt hợp đồng.')
    } catch { /* Lỗi được hiển thị dưới danh sách để có thể thử lại. */ }
  }

  return <div className={isAdmin ? 'detail-grid-layout' : 'space-y-6'}>
    <section className="surface-card" aria-labelledby={`${formId}-list`}>
      <div className="section-header">
        <div><h2 id={`${formId}-list`}>Thỏa thuận &amp; Hợp đồng hoa hồng{hotelName ? ` — ${hotelName}` : ''}</h2><p className="muted">Danh sách thỏa thuận từ hệ thống tài chính.</p></div>
        <Button icon={<ReloadOutlined aria-hidden="true" />} loading={query.isFetching} onClick={() => void query.refetch()}>Tải lại</Button>
      </div>
      {query.data && <div className="kpi-summary-grid" style={{ marginBottom: 18 }}>
        <div className="kpi-summary-card"><span className="kpi-summary-card__label">Tổng thỏa thuận khớp bộ lọc</span><strong className="kpi-summary-card__value">{query.data.totalElements} hợp đồng</strong></div>
        <div className="kpi-summary-card"><span className="kpi-summary-card__label">Đang hiển thị</span><strong className="kpi-summary-card__value">{query.data.content.length} hợp đồng</strong><span className="kpi-summary-card__sub">Trang {query.data.page + 1}</span></div>
        <div className="kpi-summary-card"><span className="kpi-summary-card__label">Tỷ lệ hoa hồng</span><strong className="kpi-summary-card__value is-brand">Theo từng hợp đồng</strong><span className="kpi-summary-card__sub">Không suy ra tỷ lệ áp dụng từ một trang dữ liệu.</span></div>
      </div>}
      {!isAdmin && <p className="muted">Bạn có thể tra cứu điều khoản và thời hạn tại đây. Việc tạo, gia hạn và kích hoạt hợp đồng do quản trị viên thực hiện.</p>}
      <div className="form-grid-2" style={{ marginBottom: 16 }}>
        <div><label htmlFor={`${formId}-filter`} className="muted">Lọc theo trạng thái hợp đồng</label><Select<ContractStatus | 'ALL'> id={`${formId}-filter`} className="full-width" value={status ?? 'ALL'} onChange={(value) => { setStatus(value === 'ALL' ? undefined : value); setPage(0) }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, ...contractStatusValues.map((value) => ({ value, label: statusLabels[value] }))]} /></div>
      </div>
      {query.isPending ? <PageLoading /> : query.isError ? <Alert type="error" showIcon title="Chưa tải được danh sách hợp đồng" description={errorMessage(query.error)} action={<Button loading={query.isFetching} onClick={() => void query.refetch()}>Thử lại</Button>} /> : query.data.content.length === 0 ? <EmptyState title="Không có hợp đồng hoa hồng phù hợp" /> : <div className="contracts-stack" role="list">
        {query.data.content.map((contract) => <article className="contract-item-card" role="listitem" key={contract.id}>
          <div className="contract-item-card__header" style={{ flexWrap: 'wrap' }}><span className="contract-item-card__code" style={{ maxWidth: '100%', overflowWrap: 'anywhere' }}><FileTextOutlined aria-hidden="true" /> {contract.contractCode}</span><Space wrap><Tag color="gold">Hoa hồng: {contract.commissionRate}%</Tag><Tag color={contract.status === 'ACTIVE' ? 'success' : 'default'}>{contract.status === 'ACTIVE' && Date.parse(contract.startsAt) > query.dataUpdatedAt ? 'Chưa đến ngày hiệu lực' : statusLabels[contract.status]}</Tag></Space></div>
          <p className="contract-item-card__terms">Cơ sở tính hoa hồng: {basisLabels[contract.commissionBasis]}</p>
          <div className="contract-item-card__meta"><span>Hiệu lực: <strong>{new Date(contract.startsAt).toLocaleString('vi-VN')}</strong> → <strong>{new Date(contract.endsAt).toLocaleString('vi-VN')}</strong></span></div>
          {contract.commissionBasis !== 'AFTER_DISCOUNT' && <Alert type="warning" showIcon title="Hợp đồng này dùng cách tính cũ" description="Cần hợp đồng tính hoa hồng trên tiền phòng sau giảm giá để nhận đặt phòng mới." />}
          {isAdmin && <Space wrap>
            {contract.status !== 'DRAFT' && <Button disabled={busy} onClick={() => {
              const start = new Date(Math.ceil(Math.max(Date.parse(contract.endsAt), Date.now()) / 1000) * 1000)
              const end = new Date(start); end.setFullYear(end.getFullYear() + 1)
              const local = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
              reset({ contractCode: '', ownerUserId, commissionRate: contract.commissionRate, commissionBasis: 'AFTER_DISCOUNT', startsAt: local(start), endsAt: local(end), renewalOfContractId: contract.id })
              setRenewingCode(contract.contractCode)
              mutation.reset()
              requestAnimationFrame(() => { formPanel.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); formPanel.current?.querySelector<HTMLInputElement>('input:not([type="hidden"])')?.focus({ preventScroll: true }) })
            }}>Gia hạn</Button>}

            {contract.status === 'DRAFT' && <Popconfirm title="Kích hoạt hợp đồng này?" description="Khách sạn có thể nhận đặt phòng khi hợp đồng có hiệu lực và đủ điều kiện mở bán." okText="Kích hoạt" cancelText="Quay lại" onConfirm={() => changeStatus(contract.id, 'activate')}><Button disabled={busy}>Kích hoạt hợp đồng</Button></Popconfirm>}
            {['DRAFT', 'ACTIVE'].includes(contract.status) && <Popconfirm title="Chấm dứt hợp đồng này?" description="Khách sạn ngừng nhận đơn mới nếu không có hợp đồng hiệu lực khác. Các đơn đã tạo được giữ nguyên." okText="Chấm dứt" cancelText="Quay lại" onConfirm={() => changeStatus(contract.id, 'terminate')}><Button danger disabled={busy}>Chấm dứt hợp đồng</Button></Popconfirm>}
          </Space>}
        </article>)}
      </div>}
      {query.data && <Pagination current={page + 1} pageSize={size} total={query.data.totalElements} showSizeChanger onChange={(next, nextSize) => { setPage(nextSize === size ? next - 1 : 0); setSize(nextSize) }} />}
      {lifecycle.isError && <Alert type="error" showIcon title="Không thể cập nhật hợp đồng" description={errorMessage(lifecycle.error)} />}
    </section>
    {isAdmin && <aside ref={formPanel} className="surface-card scroll-mt-24" aria-labelledby={`${formId}-create`}>
      <h2 id={`${formId}-create`}>{renewingCode ? `Gia hạn từ ${renewingCode}` : 'Tạo dự thảo hợp đồng hoa hồng'}</h2>
      <p className="muted">Hoa hồng tính cố định trên tiền phòng sau giảm giá. Thiết lập tỷ lệ và thời điểm hiệu lực. Thời gian hiển thị theo múi giờ thiết bị.</p>
      {!ownerUserId && <Alert type="warning" showIcon title="Chưa xác định được chủ khách sạn. Vui lòng tải lại thông tin khách sạn." />}
      {mutation.isError && <Alert type="error" showIcon title="Không thể tạo hợp đồng" description={errorMessage(mutation.error)} />}
      <Form layout="vertical" component="form" className="admin-form" noValidate disabled={busy || !ownerUserId} onSubmitCapture={event => void handleSubmit(submit)(event)}>
        <Form.Item label="Mã hợp đồng thỏa thuận" htmlFor={`${formId}-code`} required validateStatus={errors.contractCode ? 'error' : undefined} help={errors.contractCode?.message}><Controller name="contractCode" control={control} render={({ field }) => <Input {...field} id={`${formId}-code`} maxLength={50} size="large" />} /></Form.Item>
        <Form.Item label="Chủ sở hữu" validateStatus={errors.ownerUserId ? 'error' : undefined} help={errors.ownerUserId?.message}><p>Chủ sở hữu hiện tại của khách sạn.</p><input type="hidden" value={ownerUserId} readOnly /></Form.Item>
        <div className="form-grid-2">
          <Form.Item label="Tỷ lệ hoa hồng (%)" htmlFor={`${formId}-rate`} required validateStatus={errors.commissionRate ? 'error' : undefined} help={errors.commissionRate?.message}><Controller name="commissionRate" control={control} render={({ field }) => <InputNumber id={`${formId}-rate`} className="full-width" size="large" min={0} max={100} step={0.01} value={field.value} onChange={(value) => field.onChange(value)} />} /></Form.Item>
          <p className="muted">Căn cứ: tiền phòng sau giảm giá. Phụ thu được giữ trong khoản owner được hưởng.</p>
        </div>
        <div className="form-grid-2">
          <Form.Item label="Hiệu lực từ thời điểm" htmlFor={`${formId}-start`} required validateStatus={errors.startsAt ? 'error' : undefined} help={errors.startsAt?.message}><Controller name="startsAt" control={control} render={({ field }) => <Input {...field} id={`${formId}-start`} type="datetime-local" step={1} size="large" />} /></Form.Item>
          <Form.Item label="Hiệu lực đến thời điểm" htmlFor={`${formId}-end`} required validateStatus={errors.endsAt ? 'error' : undefined} help={errors.endsAt?.message}><Controller name="endsAt" control={control} render={({ field }) => <Input {...field} id={`${formId}-end`} type="datetime-local" step={1} size="large" />} /></Form.Item>
        </div>
        <Button type="primary" htmlType="submit" size="large" className="full-width" icon={<PlusOutlined aria-hidden="true" />} loading={mutation.isPending} disabled={busy || !ownerUserId}>{renewingCode ? 'Tạo dự thảo gia hạn' : 'Tạo dự thảo hợp đồng'}</Button>
        {renewingCode && <Button disabled={busy} onClick={() => { setRenewingCode(undefined); reset({ contractCode: '', ownerUserId, commissionRate: 12, commissionBasis: 'AFTER_DISCOUNT', startsAt: '', endsAt: '', renewalOfContractId: undefined }) }}>Hủy gia hạn</Button>}
      </Form>
    </aside>}
  </div>
}
