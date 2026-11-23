import { useNavigate } from 'react-router'
import { AuthModal } from '@/features/auth'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[60vh] w-full">
      <AuthModal
        isOpen
        initialMode="forgot-password"
        onClose={() => {
          void navigate('/', { replace: true })
        }}
      />
    </div>
  )
}
