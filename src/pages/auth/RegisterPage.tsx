import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { AuthModal } from '@/features/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const signedIn = useRef(false)
  return (
    <div className="min-h-[60vh] w-full">
      <AuthModal
        isOpen
        initialMode="register"
        onClose={() => { if (!signedIn.current) void navigate('/', { replace: true }) }}
        onSuccess={() => {
          signedIn.current = true
          void navigate('/account', { replace: true })
        }}
      />
    </div>
  )
}
