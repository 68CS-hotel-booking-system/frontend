import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, Tag } from 'antd'
import {
  AppstoreOutlined,
  ClockCircleOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@/shared/ui/PageHeader'

interface ManagementPlaceholderPageProps {
  title: string
  kicker: string
  description: string
  icon?: ReactNode
  badge?: string
}

export function ManagementPlaceholderPage({
  title,
  kicker,
  description,
  icon,
  badge = 'Đang được hoàn thiện',
}: ManagementPlaceholderPageProps) {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-1.5">
            {icon ?? <ToolOutlined />} {kicker}
          </span>
        }
        title={title}
        description={description}
        extra={
          <Tag color="cyan" className="font-semibold !rounded-full text-xs">
            {badge}
          </Tag>
        }
      />

      {/* Main card */}
      <Card className="shadow-xs border-[#dce7e3] rounded-2xl bg-white overflow-hidden">
        <div className="py-16 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#eef8f5] text-[#0b5f53] flex items-center justify-center text-3xl mb-5 shadow-xs">
            {icon ?? <ToolOutlined />}
          </div>

          <h2 className="text-xl font-bold text-[#12211d] mb-2.5">
            Phân hệ {title} đang được hoàn thiện
          </h2>

          <p className="text-sm text-[#5f736e] leading-relaxed mb-6">
            Dữ liệu và các nghiệp vụ chuyên sâu cho phân hệ này đang trong lộ trình phát triển và kết nối theo đặc tả API của StayHub.
          </p>

          <div className="w-full bg-[#f7fbfa] border border-[#dce7e3] rounded-xl p-4 mb-8 text-xs text-[#5f736e] flex items-center justify-center gap-2">
            <ClockCircleOutlined className="text-[#0b5f53] text-sm" />
            <span>Tính năng sẽ được tự động kích hoạt ngay khi mở cổng dịch vụ tương ứng.</span>
          </div>

          <Button
            type="primary"
            icon={<AppstoreOutlined />}
            size="large"
            className="!rounded-xl !h-11 !px-8 font-semibold !bg-[#0b5f53] hover:!bg-[#08473e]"
            onClick={() => void navigate('/admin/overview')}
          >
            Về trang Tổng quan
          </Button>
        </div>
      </Card>
    </div>
  )
}
