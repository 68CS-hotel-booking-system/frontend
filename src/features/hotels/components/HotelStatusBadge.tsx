import type { HotelStatus } from '../types/hotel-management'

const STATUS_STYLE_MAP: Record<
  HotelStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  ACTIVE: {
    label: 'Đang hoạt động',
    bg: 'var(--atelier-tertiary-fixed)',
    color: 'var(--atelier-on-tertiary-fixed)',
    dot: 'var(--atelier-tertiary)',
  },
  PENDING_APPROVAL: {
    label: 'Chờ phê duyệt',
    bg: 'var(--atelier-primary-fixed)',
    color: 'var(--atelier-on-primary-fixed)',
    dot: 'var(--atelier-primary)',
  },
  DRAFT: {
    label: 'Bản nháp',
    bg: 'var(--atelier-surface-container)',
    color: 'var(--atelier-on-surface-variant)',
    dot: 'var(--atelier-secondary)',
  },
  REJECTED: {
    label: 'Từ chối duyệt',
    bg: 'var(--atelier-error-container)',
    color: 'var(--atelier-on-error-container)',
    dot: 'var(--atelier-error)',
  },
  SUSPENDED: {
    label: 'Tạm đình chỉ',
    bg: 'var(--atelier-error-container)',
    color: 'var(--atelier-on-error-container)',
    dot: 'var(--atelier-error)',
  },
}

export function HotelStatusBadge({ status }: { status: HotelStatus }) {
  const meta = STATUS_STYLE_MAP[status] ?? {
    label: status,
    bg: 'var(--atelier-surface-container)',
    color: 'var(--atelier-on-surface-variant)',
    dot: 'var(--atelier-secondary)',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 9999,
        backgroundColor: meta.bg,
        color: meta.color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
        lineHeight: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 9999,
          backgroundColor: meta.dot,
        }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}
