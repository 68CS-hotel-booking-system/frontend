import { Alert } from 'antd'
import { ApiError, errorMessage } from '@/shared/api/api-error'

export function HotelReviewError({ error }: { error: unknown }) {
  return <Alert type="error" showIcon title={errorMessage(error)} description={error instanceof ApiError && <>
    {error.errors.length > 0 && <ul>{error.errors.map((item) => <li key={`${item.field}:${item.message}`}>{item.message}</li>)}</ul>}
    {error.status === 409 && <p>Trạng thái mới nhất đã được tải lại. Vui lòng kiểm tra hồ sơ trước khi thao tác tiếp.</p>}
    {error.traceId && <p>Mã tra cứu: {error.traceId}</p>}
  </>} />
}
