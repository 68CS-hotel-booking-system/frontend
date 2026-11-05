import type { AdminUser } from '../model/user'

export const INITIAL_MOCK_USERS: AdminUser[] = [
  {
    id: '1',
    fullName: 'Lê Hoàng Nam',
    email: 'lehoangnam@gmail.com',
    phone: '0912 345 678',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    joinedDate: '24/10/2024',
    avatarInitials: 'LN',
    avatarBg: '#E2E8F0',
    avatarColor: '#334155',
  },
]
