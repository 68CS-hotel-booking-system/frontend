import {
  ArrowLeftOutlined, CalendarOutlined, CheckCircleOutlined, CheckOutlined, DesktopOutlined, DownOutlined,
  EyeInvisibleOutlined, EyeOutlined, HeartOutlined, HomeOutlined, KeyOutlined,
  LockOutlined, LogoutOutlined, MessageOutlined, SafetyOutlined, TeamOutlined, UploadOutlined,
  UserOutlined, WarningOutlined,
} from '@ant-design/icons'

export type AccountIconName = 'back' | 'user' | 'lock' | 'lock-small' | 'bed' | 'heart' | 'chat' | 'staff' | 'logout' | 'calendar' | 'down' | 'eye' | 'upload' | 'badge-check' | 'shield'
  | 'eye-off' | 'check' | 'device' | 'key' | 'alert-triangle'

const icons = {
  back: ArrowLeftOutlined, user: UserOutlined, lock: LockOutlined, 'lock-small': LockOutlined,
  bed: HomeOutlined, heart: HeartOutlined, chat: MessageOutlined, staff: TeamOutlined,
  logout: LogoutOutlined, calendar: CalendarOutlined, down: DownOutlined, eye: EyeOutlined,
  upload: UploadOutlined, 'badge-check': CheckCircleOutlined, shield: SafetyOutlined, 'eye-off': EyeInvisibleOutlined,
  check: CheckOutlined, device: DesktopOutlined, key: KeyOutlined, 'alert-triangle': WarningOutlined,
} satisfies Record<AccountIconName, typeof UserOutlined>

export function AccountIcon({ name }: { name: AccountIconName }) {
  const Icon = icons[name]
  return <span className={`account-icon account-icon--${name}`} aria-hidden="true">
    <Icon />
  </span>
}
