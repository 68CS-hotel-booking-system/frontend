import { useEffect, useState } from 'react'
import { readAuthLinkToken } from '../model/auth-link-token'

export function stripAuthLinkTokenFromLocation(
  loc: Pick<Location, 'href'> = window.location,
  hist: Pick<History, 'replaceState' | 'state'> = window.history,
) {
  const url = new URL(loc.href)
  const currentPath = url.pathname + url.search + url.hash
  const { cleanPath } = readAuthLinkToken(url.href)
  if (cleanPath !== currentPath) {
    hist.replaceState(hist.state, '', cleanPath)
  }
}

export function useAuthLinkToken() {
  const [token] = useState(() => (typeof window === 'undefined' ? '' : readAuthLinkToken(window.location.href).token))
  useEffect(() => {
    stripAuthLinkTokenFromLocation()
  }, [])
  return token
}
