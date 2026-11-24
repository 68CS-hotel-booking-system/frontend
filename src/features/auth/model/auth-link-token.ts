export function readAuthLinkToken(href: string) {
  const url = new URL(href)
  const rawHash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  const hashParams = new URLSearchParams(rawHash)
  const hasHashToken = hashParams.has('token')
  const hashToken = hasHashToken ? (hashParams.get('token') ?? '') : ''
  if (hasHashToken) {
    hashParams.delete('token')
    const remainingHash = hashParams.toString()
    url.hash = remainingHash ? `#${remainingHash}` : ''
  }

  const hasQueryToken = url.searchParams.has('token')
  const queryToken = hasQueryToken ? (url.searchParams.get('token') ?? '') : ''
  if (hasQueryToken) {
    url.searchParams.delete('token')
  }

  return {
    token: hashToken || queryToken,
    cleanPath: url.pathname + url.search + url.hash,
  }
}
