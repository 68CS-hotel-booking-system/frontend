import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError, errorMessage } from '@/shared/api/api-error'
import { getGoogleChallenge } from '../api/auth-api'
import { useGoogleSignIn } from '../hooks/use-auth-action'
import { loadGoogleIdentity } from '../model/google-identity'

interface GoogleAuthButtonProps {
  mode: 'login' | 'register'
  onSuccess: (user: unknown) => void
  onEnrollmentChange: (enrolling: boolean) => void
}

export function GoogleAuthButton({ mode, onSuccess, onEnrollmentChange }: GoogleAuthButtonProps) {
  const phoneId = useId()
  const target = useRef<HTMLDivElement>(null)
  const inFlight = useRef(false)
  const [credential, setCredential] = useState('')
  const [message, setMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const challenge = useQuery({
    queryKey: ['auth', 'google-challenge'],
    queryFn: ({ signal }) => getGoogleChallenge(signal),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })
  const google = useGoogleSignIn()

  function clearEnrollment() {
    setCredential('')
    onEnrollmentChange(false)
  }

  async function submit(token: string, phone?: string) {
    if (!token || inFlight.current) return
    inFlight.current = true
    setMessage('')
    try {
      const result = await google.mutateAsync({ credential: token, phone })
      onSuccess(result)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'GOOGLE_PHONE_REQUIRED') {
        setCredential(token)
        onEnrollmentChange(true)
      } else {
        setMessage(errorMessage(error))
        if (error instanceof ApiError && error.code === 'GOOGLE_TOKEN_INVALID') {
          clearEnrollment()
          void challenge.refetch()
        }
      }
    } finally {
      inFlight.current = false
    }
  }

  const receiveCredential = useEffectEvent((token: string) => { void submit(token) })
  const clientId = challenge.data?.clientId
  const nonce = challenge.data?.nonce
  const enrolling = Boolean(credential)
  useEffect(() => {
    const container = target.current
    if (!clientId || !nonce || !container || enrolling) return

    let disposed = false
    let observer: ResizeObserver | undefined
    void loadGoogleIdentity().then(identity => {
      if (disposed) return
      identity.initialize({
        client_id: clientId,
        nonce,
        context: mode === 'register' ? 'signup' : 'signin',
        callback: ({ credential }) => {
          if (!disposed) receiveCredential(credential)
        },
      })

      let previousWidth = 0
      const render = () => {
        const width = Math.min(400, container.clientWidth)
        if (!width || width === previousWidth) return
        previousWidth = width
        container.replaceChildren()
        identity.renderButton(container, {
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          width,
          locale: 'vi',
        })
      }
      render()
      observer = new ResizeObserver(render)
      observer.observe(container)
      setReady(true)
      setLoadFailed(false)
    }).catch(() => {
      if (!disposed) setLoadFailed(true)
    })
    return () => {
      disposed = true
      observer?.disconnect()
      container.replaceChildren()
    }
  }, [attempt, clientId, nonce, mode, enrolling])

  if (challenge.isError) {
    return <div className="auth-google">
      <button type="button" className="auth-switch-btn" onClick={() => void challenge.refetch()}>
        Thử tải lại nút Google
      </button>
    </div>
  }
  if (!clientId) return null

  return <div className="auth-google" aria-busy={google.isPending}>
    {message && <p className="auth-alert-box" role="alert">{message}</p>}
    {enrolling ? (
      <form className="auth-google-phone" onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        void submit(credential, String(data.get('phone') ?? '').trim())
      }}>
        <p>Số điện thoại giúp nơi lưu trú liên hệ với bạn về đơn đặt phòng.</p>
        <div className="auth-field-group">
          <label className="auth-field-label" htmlFor={phoneId}>Số điện thoại</label>
          <input className="auth-input" id={phoneId} name="phone" type="tel" autoComplete="tel"
            placeholder="0912 345 678" maxLength={20} required readOnly={google.isPending} />
        </div>
        <button type="submit" className="auth-btn-primary" disabled={google.isPending}>Tạo tài khoản</button>
        <button type="button" className="auth-switch-btn" disabled={google.isPending} onClick={clearEnrollment}>
          Quay lại
        </button>
      </form>
    ) : <>
      {loadFailed ? <button type="button" className="auth-switch-btn" onClick={() => {
        setLoadFailed(false)
        setReady(false)
        setAttempt(value => value + 1)
      }}>Thử tải lại nút Google</button>
        : !ready && <p role="status">Đang tải nút Google…</p>}
      <div ref={target} className="auth-google-button" inert={google.isPending} />
      {google.isPending && <p role="status">Đang xác minh tài khoản Google…</p>}
      <div className="auth-google-divider">hoặc dùng email</div>
    </>}
  </div>
}
