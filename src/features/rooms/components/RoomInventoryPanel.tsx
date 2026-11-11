import { useState } from 'react'
import { z } from 'zod'
import dayjs from 'dayjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Input, Modal, Select, Space, Table, Tag } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageLoading } from '@/shared/ui/PageLoading'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { useInventory } from '../hooks/use-inventory'
import { inventoryRangeSchema, blockFormSchema, releaseFormSchema } from '../model/inventory'
import type { RoomBlock } from '../api/inventory-api'

export function RoomInventoryPanel({ hotelId, hotelStatus }: { hotelId: string; hotelStatus: string }) {
  const { message } = App.useApp()
  const [range, setRange] = useState({ startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().add(6, 'day').format('YYYY-MM-DD') })
  const { calendar, blocks, mutation } = useInventory(hotelId, range)
  const dates = useForm<z.infer<typeof inventoryRangeSchema>>({ resolver: zodResolver(inventoryRangeSchema), defaultValues: range })
  const blockForm = useForm<z.infer<typeof blockFormSchema>>({ resolver: zodResolver(blockFormSchema) })
  const releaseForm = useForm<z.infer<typeof releaseFormSchema>>({ resolver: zodResolver(releaseFormSchema), defaultValues: { reason: '' } })
  const [blockOpen, setBlockOpen] = useState(false)
  const [editing, setEditing] = useState<RoomBlock | null>(null)
  const [releasing, setReleasing] = useState<RoomBlock | null>(null)
  const rows = calendar.data?.roomTypes.flatMap((type) => type.dailySummaries.map((summary) => ({ ...summary, key: `${type.roomTypeId}:${summary.date}`, name: type.roomTypeName }))) ?? []
  const physical = calendar.data?.roomTypes.flatMap((type) => type.rooms.map((room) => ({ ...room, typeName: type.roomTypeName }))) ?? []
  const openBlock = (block?: RoomBlock) => {
    setEditing(block ?? null)
    blockForm.reset(block ? { roomId: block.roomId, startDate: block.startDate, endDate: block.endDate, reason: block.reason } : { roomId: '', ...range, reason: '' })
    setBlockOpen(true)
  }
  return <section className="surface-card space-y-5">
    <div className="section-header"><div><h2>Tồn kho & lịch phòng</h2><p className="muted">Số phòng khả dụng lấy từ backend. Khoảng ngày bao gồm cả ngày kết thúc.</p></div><Button onClick={() => openBlock()} disabled={hotelStatus !== 'ACTIVE' || !physical.length || mutation.isPending}>Chặn phòng</Button></div>
    <form onSubmit={dates.handleSubmit((values) => {
      setRange(values)
      if (values.startDate === range.startDate && values.endDate === range.endDate) {
        void calendar.refetch(); void blocks.refetch()
      }
    })}><Space wrap>
      <label>Từ ngày<Input type="date" {...dates.register('startDate')} /></label>
      <label>Đến ngày<Input type="date" {...dates.register('endDate')} /></label>
      <Button htmlType="submit" loading={calendar.isFetching || blocks.isFetching}>Tra cứu tồn kho</Button>
    </Space>{Object.entries(dates.formState.errors).map(([field, error]) => <p role="alert" key={field}>{error?.message}</p>)}</form>
    {mutation.isError && <Alert type="error" title="Không thể lưu thay đổi" description={errorMessage(mutation.error)} showIcon />}
    {hotelStatus !== 'ACTIVE' && <Alert type="info" title="Tạo lịch chặn mới cần khách sạn ACTIVE theo quy tắc backend." showIcon />}
    {calendar.isPending ? <PageLoading /> : calendar.isError ? <ErrorState error={calendar.error} onRetry={() => void calendar.refetch()} /> : <>
      <Table size="small" rowKey="key" dataSource={rows} scroll={{ x: 700 }} pagination={{ pageSize: 14 }} locale={{ emptyText: 'Chưa có hạng phòng đang bán trong khoảng ngày.' }} columns={[
        { title: 'Hạng phòng', dataIndex: 'name' }, { title: 'Ngày', dataIndex: 'date' }, { title: 'Đang phục vụ', dataIndex: 'operationalRooms' }, { title: 'Bị chặn', dataIndex: 'blockedRooms' }, { title: 'Đã giữ/đặt', dataIndex: 'reservedRooms' }, { title: 'Còn trống', dataIndex: 'availableRooms' },
      ]} />
      <h3>Trạng thái buồng phòng</h3>
      <Table size="small" rowKey="roomId" dataSource={physical} scroll={{ x: 550 }} pagination={{ pageSize: 10 }} locale={{ emptyText: 'Chưa có phòng vật lý trong hạng đang bán.' }} columns={[
        { title: 'Phòng', dataIndex: 'roomNumber' }, { title: 'Hạng phòng', dataIndex: 'typeName' }, { title: 'Tầng', dataIndex: 'floor' },
        { title: 'Sẵn sàng', render: (_, room) => <Select aria-label={`Trạng thái phòng ${room.roomNumber}`} value={room.readiness} disabled={mutation.isPending} options={[{ value: 'READY', label: 'READY — Sẵn sàng' }, { value: 'DIRTY', label: 'DIRTY — Cần dọn' }]} onChange={async (readiness: 'READY' | 'DIRTY') => { try { await mutation.mutateAsync({ kind: 'readiness', roomId: room.roomId, readiness }); void message.success('Đã cập nhật trạng thái phòng.') } catch { /* Error is rendered above. */ } }} /> },
      ]} />
    </>}
    <h3>Lịch chặn phòng</h3>
    {blocks.isPending ? <PageLoading /> : blocks.isError ? <ErrorState error={blocks.error} onRetry={() => void blocks.refetch()} /> : <Table size="small" rowKey="id" dataSource={blocks.data} scroll={{ x: 750 }} pagination={{ pageSize: 10 }} locale={{ emptyText: 'Không có lịch chặn trong khoảng ngày.' }} columns={[
      { title: 'Phòng', render: (_, block) => physical.find((room) => room.roomId === block.roomId)?.roomNumber ?? block.roomId },
      { title: 'Từ ngày', dataIndex: 'startDate' }, { title: 'Đến ngày', dataIndex: 'endDate' }, { title: 'Lý do', dataIndex: 'reason' },
      { title: 'Trạng thái', render: (_, block) => <Tag>{block.status === 'ACTIVE' ? 'Đang chặn' : 'Đã giải phóng'}</Tag> },
      { title: 'Thao tác', render: (_, block) => block.status === 'ACTIVE' && <Space><Button disabled={mutation.isPending} onClick={() => openBlock(block)}>Sửa</Button><Button disabled={mutation.isPending} onClick={() => { releaseForm.reset({ reason: '' }); setReleasing(block) }}>Giải phóng</Button></Space> },
    ]} />}
    <Modal title={editing ? 'Sửa lịch chặn phòng' : 'Tạo lịch chặn phòng'} open={blockOpen} onCancel={() => { if (!mutation.isPending) setBlockOpen(false) }} footer={null}>
      <form className="space-y-4" onSubmit={blockForm.handleSubmit(async (values) => {
        if (mutation.isPending) return
        try {
          const { roomId, ...payload } = values
          await mutation.mutateAsync(editing ? { kind: 'update', blockId: editing.id, payload } : { kind: 'create', payload: { ...payload, roomId } })
          setBlockOpen(false); void message.success('Đã lưu lịch chặn phòng.')
        } catch (error) { applyApiFieldErrors(error, blockForm.setError); blockForm.setError('root', { message: errorMessage(error) }) }
      })}>
        <label className="block">Phòng vật lý<Controller name="roomId" control={blockForm.control} render={({ field }) => <Select {...field} className="w-full" aria-label="Phòng cần chặn" disabled={Boolean(editing) || mutation.isPending} options={physical.map((room) => ({ value: room.roomId, label: `${room.roomNumber} — ${room.typeName}` }))} />} /></label>
        <label className="block">Từ đêm<Input type="date" {...blockForm.register('startDate')} /></label>
        <label className="block">Đến hết đêm<Input type="date" {...blockForm.register('endDate')} /></label>
        <label className="block">Lý do<Input.TextArea {...blockForm.register('reason')} maxLength={255} /></label>
        {Object.entries(blockForm.formState.errors).map(([field, error]) => <p role="alert" key={field}>{error?.message}</p>)}
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Lưu lịch chặn</Button>
      </form>
    </Modal>
    <Modal title="Giải phóng lịch chặn" open={Boolean(releasing)} onCancel={() => { if (!mutation.isPending) setReleasing(null) }} footer={null}>
      <form className="space-y-4" onSubmit={releaseForm.handleSubmit(async (values) => {
        if (!releasing || mutation.isPending) return
        try { await mutation.mutateAsync({ kind: 'release', blockId: releasing.id, reason: values.reason }); setReleasing(null); void message.success('Đã giải phóng lịch chặn.') }
        catch (error) { releaseForm.setError('root', { message: errorMessage(error) }) }
      })}>
        <label className="block">Lý do giải phóng<Input.TextArea {...releaseForm.register('reason')} maxLength={255} /></label>
        {releaseForm.formState.errors.reason && <p role="alert">{releaseForm.formState.errors.reason.message}</p>}
        {releaseForm.formState.errors.root && <p role="alert">{releaseForm.formState.errors.root.message}</p>}
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>Giải phóng lịch chặn</Button>
      </form>
    </Modal>
  </section>
}
