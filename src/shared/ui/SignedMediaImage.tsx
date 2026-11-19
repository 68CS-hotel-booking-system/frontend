import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMediaAccess } from '@/shared/api/media-access'

export function SignedMediaImage({ mediaId, scope, alt, className, fallback = null }: {
  mediaId: string
  scope: string
  alt: string
  className?: string
  fallback?: ReactNode
}) {
  const [failedUrl, setFailedUrl] = useState<string>()
  const query = useQuery({
    queryKey: ['signed-media-image', scope, mediaId],
    queryFn: ({ signal }) => getMediaAccess(mediaId, signal),
    staleTime: 60_000,
    retry: false,
    refetchInterval: ({ state }) => {
      const deadline = Date.parse(state.data?.expiresAt ?? '')
      return !state.error && Number.isFinite(deadline) ? Math.max(1000, deadline - Date.now() - 10_000) : false
    },
  })
  const url = query.data?.url
  if (!url || url === failedUrl) return fallback
  return <img src={url} alt={alt} className={className} loading="lazy" onError={() => setFailedUrl(url)} />
}
