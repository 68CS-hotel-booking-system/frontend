import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Form, Input, Modal, Space } from 'antd'
import { useCurrentUser } from '@/features/auth'
import { errorMessage } from '@/shared/api/api-error'
import { changeHotelSalesStatus, type HotelSalesAction } from '../api/hotel-management-api'
import { hotelManagementKeys } from '../hooks/hotel-query-keys'
import type { HotelStatus } from '../model/hotel'

const labels: Record<HotelSalesAction, string> = { suspend: 'Tạm ngừng bán', resume: 'Mở bán lại', lock: 'Khóa bán', unlock: 'Gỡ khóa bán' }
export function HotelSalesControls({ hotelId, status }: { hotelId: string; status: HotelStatus }) {
  const { isAdmin, isOwner } = useCurrentUser()
  const [action, setAction] = useState<HotelSalesAction>()
  if (!isAdmin && !isOwner) return null
  return <section className="surface-card"><h2>Trạng thái mở bán</h2><p className="muted">Tạm ngừng hoặc khóa bán chặn đơn mới. Các đơn đã có vẫn được phục vụ.</p>
    <Space wrap>
      {status === 'ACTIVE' && <Button onClick={() => setAction('suspend')}>Tạm ngừng bán</Button>}
      {status === 'SUSPENDED' && <Button type="primary" onClick={() => setAction('resume')}>Mở bán lại</Button>}
      {isAdmin && status !== 'LOCKED' && ['DRAFT', 'ACTIVE', 'SUSPENDED'].includes(status) && <Button danger onClick={() => setAction('lock')}>Khóa bán</Button>}
      {isAdmin && status === 'LOCKED' && <Button onClick={() => setAction('unlock')}>Gỡ khóa bán</Button>}
    </Space>
    <Modal open={Boolean(action)} title={action ? labels[action] : ''} onCancel={() => setAction(undefined)} footer={null} destroyOnHidden>
      {action && <SalesStatusForm key={action} hotelId={hotelId} action={action} onComplete={() => setAction(undefined)} />}
    </Modal>
  </section>
}
function SalesStatusForm({ hotelId, action, onComplete }: { hotelId: string; action: HotelSalesAction; onComplete: () => void }) {
  const client = useQueryClient()
  const reason = action === 'lock' || action === 'unlock' ? z.string().trim().min(1, 'Nhập lý do thay đổi.').max(500) : z.string().trim().max(500)
  const schema = z.object({ reason })
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { reason: '' } })
  const mutation = useMutation({ mutationFn: (values: { reason: string }) => changeHotelSalesStatus(hotelId, action, values.reason), retry: false,
    onSuccess: async () => { await client.invalidateQueries({ queryKey: hotelManagementKeys.all }); await client.invalidateQueries({ queryKey: ['discovery'] }); onComplete() } })
  return <Form layout="vertical" component="form" noValidate disabled={mutation.isPending} onSubmitCapture={form.handleSubmit((values) => mutation.mutate(values))}>
    <Form.Item label="Lý do thay đổi" htmlFor="hotel-sales-reason" validateStatus={form.formState.errors.reason ? 'error' : undefined} help={form.formState.errors.reason?.message}>
      <Controller name="reason" control={form.control} render={({ field }) => <Input.TextArea {...field} id="hotel-sales-reason" rows={3} maxLength={500} />} />
    </Form.Item>
    <Button type="primary" danger={action === 'lock'} htmlType="submit" loading={mutation.isPending}>Xác nhận {labels[action].toLowerCase()}</Button>
    {mutation.isError && <Alert type="error" showIcon title="Chưa thể thay đổi trạng thái" description={errorMessage(mutation.error)} />}
  </Form>
}
