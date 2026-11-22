import { Suspense, useEffect, useRef, useState } from 'react'
import { ConfigProvider } from 'antd'
import { Outlet, useLocation, useNavigationType } from 'react-router'
import {
  ClientHomeProvider,
  useClientHomeContext,
  ClientSvgSprite,
  ClientSiteHeader,
  ClientMobileMenu,
  ClientSiteFooter,
  ClientToast,
} from '@/features/discovery'
import { AuthModal } from '@/features/auth'
import { PageLoading } from '@/shared/ui/PageLoading'

function ClientHomeLayout() {
  const { pathname, hash } = useLocation()
  const previousPath = useRef(pathname)
  const navigationType = useNavigationType()
  const isHotelDetail = pathname.startsWith('/stays/')
  useEffect(() => {
    const changed = previousPath.current !== pathname
    previousPath.current = pathname
    if (!changed || hash || navigationType === 'POP') return
    const frame = requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, navigationType])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {
    savedIds,
    toastMessage,
    showToast,
    authModalState,
    openAuthModal,
    closeAuthModal,
  } = useClientHomeContext()

  const previousModalPath = useRef(pathname)
  useEffect(() => {
    if (previousModalPath.current === pathname) return
    previousModalPath.current = pathname
    closeAuthModal()
  }, [pathname, closeAuthModal])

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#c91f4b', colorInfo: '#245b91', colorText: '#241f20', colorTextSecondary: '#655b5f', colorBorder: '#e9e0e2', colorBgLayout: '#fffcfb', fontFamily: '"Be Vietnam Pro", system-ui, sans-serif', borderRadius: 12, controlHeight: 44 }, components: { Table: { headerBg: '#faf3f4', headerColor: '#241f20', borderColor: '#e9e0e2', cellPaddingBlock: 18 } } }}>
    <div className={`client-theme ref-theme stayhub-client min-h-screen flex flex-col${isHotelDetail ? ' hotel-detail-theme' : ''}`}>
      <ClientSvgSprite />
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>

      <ClientSiteHeader
        savedCount={savedIds.size}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        isMobileMenuOpen={mobileMenuOpen}
        onOpenAuthModal={(mode) => openAuthModal(mode)}
      />

      <ClientMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuthModal={(mode) => openAuthModal(mode)}
      />

      <main id="main" tabIndex={-1} className="flex-1 w-full">
        <Suspense fallback={<PageLoading />}><Outlet /></Suspense>
      </main>

      <ClientSiteFooter />
      <ClientToast message={toastMessage} />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={closeAuthModal}
        onSuccess={() => {
          showToast('Đăng nhập thành công! Chào mừng bạn trở lại.')
        }}
      />
    </div>
    </ConfigProvider>
  )
}

export function AppLayout() {
  return (
    <ClientHomeProvider>
      <ClientHomeLayout />
    </ClientHomeProvider>
  )
}
