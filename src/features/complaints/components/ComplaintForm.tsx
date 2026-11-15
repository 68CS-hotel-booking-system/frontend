import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Form, Input, Select } from 'antd'
import { Link } from 'react-router'
import { errorMessage } from '@/shared/api/api-error'
import { applyApiFieldErrors } from '@/shared/lib/form-errors'
import { complaintCategories, complaintFormSchema, submitComplaint, type ComplaintFormValues } from '../api/complaint-api'

import { complaintCategoryLabels } from '../model/complaint-labels'
export function ComplaintForm({ bookingId }: { bookingId: string }) {
  const client = useQueryClient()
  const mutation = useMutation({ mutationFn: (values: ComplaintFormValues) => submitComplaint(bookingId, values), retry: false,
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['complaints'] }) } })
  const { control, handleSubmit, setError, formState: { errors } } = useForm<ComplaintFormValues>({ resolver: zodResolver(complaintFormSchema), defaultValues: { category: 'ROOM_CONDITION', content: '' } })
  if (mutation.isSuccess) return <Alert type="success" showIcon title="Đã tiếp nhận khiếu nại" description={<Link to="/my-complaints">Theo dõi trạng thái khiếu nại</Link>} />
  return <Form layout="vertical" component="form" noValidate disabled={mutation.isPending} onSubmitCapture={handleSubmit(async (values) => {
    try { await mutation.mutateAsync(values) } catch (error) { applyApiFieldErrors(error, setError) }
  })}>
    <Form.Item label="Loại khiếu nại" htmlFor="complaint-category"><Controller name="category" control={control} render={({ field }) => <Select {...field} id="complaint-category" options={complaintCategories.map((value) => ({ value, label: complaintCategoryLabels[value] }))} />} /></Form.Item>
    <Form.Item label="Nội dung" htmlFor="complaint-content" required validateStatus={errors.content ? 'error' : undefined} help={errors.content?.message}>
      <Controller name="content" control={control} render={({ field }) => <Input.TextArea {...field} id="complaint-content" rows={4} maxLength={2000} showCount />} />
    </Form.Item>
    <Button type="primary" htmlType="submit" loading={mutation.isPending}>Gửi khiếu nại</Button>
    {mutation.isError && <Alert type="error" showIcon title="Chưa gửi được khiếu nại" description={errorMessage(mutation.error)} />}
  </Form>
}
