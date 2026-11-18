type IconName = 'home' | 'search' | 'globe' | 'menu' | 'user' | 'close' | 'filters' | 'heart' | 'star' | 'pin'

export function ClientReferenceIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths = {
    home: <><path d="M3 11.2 12 4l9 7.2" /><path d="M5.5 10v9.5h13V10M10 19.5v-5h4v5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 3.9 5.5 3.9 9s-1.4 6.6-3.9 9c-2.5-2.4-3.9-5.5-3.9-9S9.5 5.4 12 3Z" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    filters: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    star: <path d="m12 2.6 2.8 6.4 6.9.6-5.2 4.6 1.5 6.8-6-3.6L6 21l1.5-6.8L2.3 9.6l6.9-.6Z" />,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  }
  return <svg className="ref-icon" width={size} height={size} viewBox="0 0 24 24" fill={name === 'star' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function ClientReferenceBrand() {
  return <><ClientReferenceIcon name="home" size={26} /><span>StayHub<span className="ref-brand-sub">Chỗ nghỉ &amp; trải nghiệm</span></span></>
}
