import { Link, useSearchParams } from 'react-router'
import { Alert, Button, Descriptions, Result, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { ApiError } from '@/shared/api/api-error'
import { formatCurrencyAmount } from '@/shared/lib/format'
import { PageLoading } from '@/shared/ui/PageLoading'
import { ErrorState } from '@/shared/ui/ErrorState'
import { usePayment } from '../hooks/use-payment'
import { returnReference } from '../model/return-reference'

export function PaymentReturn() {
  const [params] = useSearchParams()
  const reference = returnReference(params)
  const query = usePayment(reference)
  if (!reference) return <Alert type="warning" showIcon title="Liên kết thanh toán không hợp lệ"
    description="Không xác định được giao dịch. Hãy kiểm tra lại liên kết thanh toán của bạn." />
  if (query.isPending) return <PageLoading />
  if (query.isError) {
    if (query.error instanceof ApiError && [403, 404].includes(query.error.status)) {
      return <Alert type="error" showIcon title="Không tìm thấy giao dịch"
        description="Giao dịch không tồn tại hoặc tài khoản hiện tại không có quyền xem. Hãy đăng nhập bằng tài khoản đã thanh toán." />
    }
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
  }
  const payment = query.data
  const pending = payment.status === 'PENDING'
  const success = payment.status === 'SUCCEEDED'
  return <>
    <div role="status" aria-live="polite">
      <Result status={pending ? 'info' : success ? 'success' : 'warning'}
        title={pending ? 'Đang xác nhận thanh toán' : success ? 'Đã ghi nhận thanh toán' : 'Thanh toán chưa thành công'}
        subTitle={pending ? 'Chúng tôi đang chờ xác nhận khoản thanh toán. Bạn có thể kiểm tra lại trạng thái bên dưới.'
          : success ? 'Khoản thanh toán đã được ghi nhận. Bạn có thể tiếp tục theo dõi trạng thái đặt phòng.'
            : 'Chưa ghi nhận thanh toán thành công cho giao dịch này. Vui lòng kiểm tra lại trước khi thanh toán lần nữa.'} />
    </div>
    <Descriptions column={1} items={[
      { key: 'payment', label: 'Mã giao dịch', children: <Typography.Text copyable className="account-member-id">{payment.id}</Typography.Text> },
      { key: 'booking', label: 'Mã đặt phòng', children: <Typography.Text copyable className="account-member-id">{payment.bookingId}</Typography.Text> },
      { key: 'amount', label: 'Số tiền', children: formatCurrencyAmount(payment.amountVnd, payment.currency) },
    ]} />
    <Space wrap style={{ marginTop: 24 }}>
      <Button icon={<ReloadOutlined aria-hidden="true" />} loading={query.isFetching} onClick={() => void query.refetch()}>Kiểm tra lại</Button>
      <Link to="/account">Về tài khoản của tôi</Link>
    </Space>
  </>
}
