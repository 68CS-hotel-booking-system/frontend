import type { ReactNode } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router'

export interface ClientAuthPageShellProps {
  title: string
  description: string
  backTo?: { to: string; label: string }
  footer?: ReactNode
  children: ReactNode
}

/**
 * Khung trang xác thực dành cho khách hàng, đồng bộ với AppLayout (#c91f4b, Be Vietnam Pro).
 */
export function ClientAuthPageShell({
  title,
  description,
  backTo,
  footer,
  children,
}: ClientAuthPageShellProps) {
  return (
    <div className="w-full px-4 py-10 sm:py-16 flex justify-center">
      <section className="w-full max-w-[460px] bg-white border border-[#e9e0e2] rounded-2xl p-6 sm:p-8 shadow-[0_14px_36px_rgb(55_33_41_/_7%)]">
        {backTo && (
          <Link
            to={backTo.to}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#655b5f] hover:text-[#c91f4b] transition-colors no-underline mb-4"
          >
            <ArrowLeftOutlined className="text-xs" aria-hidden="true" />
            <span>{backTo.label}</span>
          </Link>
        )}

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[#241f20] tracking-tight m-0">
            {title}
          </h1>
          <p className="text-sm text-[#655b5f] mt-2 mb-0 leading-relaxed">
            {description}
          </p>
        </header>

        {children}

        {footer && (
          <div className="mt-6 pt-5 border-t border-[#eee4e6] text-sm text-[#655b5f] text-center">
            {footer}
          </div>
        )}
      </section>
    </div>
  )
}
