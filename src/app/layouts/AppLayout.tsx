import { Suspense, useEffect, useState } from 'react'
import { ConfigProvider } from 'antd'
import { Outlet, useLocation } from 'react-router'
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
  const isHotelDetail = pathname.startsWith('/stays/')
  useEffect(() => {
    if (!hash) return
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {
    savedIds,
    filterState,
    pulseSaved,
    toggleSavedOnly,
    toastMessage,
    showToast,
    authModalState,
    openAuthModal,
    closeAuthModal,
  } = useClientHomeContext()

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#ff385c', colorInfo: '#ff385c', colorText: '#222222', colorTextSecondary: '#717171', colorBorder: '#ebebeb', colorBgLayout: '#ffffff', fontFamily: isHotelDetail ? 'Inter, sans-serif' : "'Liberation Sans', Arial, sans-serif", borderRadius: 12, controlHeight: 44 }, components: { Button: { borderRadius: 12 }, Table: { headerBg: '#f7f7f7', headerColor: '#222222', borderColor: '#ebebeb', cellPaddingBlock: 18 }, Tabs: { inkBarColor: '#ff385c', itemSelectedColor: '#ff385c' } } }}>
    <div className={`client-theme ref-theme min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]${isHotelDetail ? ' hotel-detail-theme' : ''}`}>
      <ClientSvgSprite />
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>

      <ClientSiteHeader
        savedCount={savedIds.size}
        isSavedActive={filterState.savedOnly}
        pulseSaved={pulseSaved}
        onToggleSaved={toggleSavedOnly}
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
