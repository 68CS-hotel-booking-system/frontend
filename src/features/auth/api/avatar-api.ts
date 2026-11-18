import { z } from 'zod'
import { http } from '@/shared/api/http'

const avatarSchema = z.object({ mediaId: z.uuid().nullish().transform(value => value ?? null) })

export function getUserAvatar(signal?: AbortSignal) {
  return http.request('/users/me/avatar', { signal, schema: avatarSchema })
}

export function uploadUserAvatar(file: File) {
  const body = new FormData()
  body.set('file', file)
  return http.request('/users/me/avatar', { method: 'PUT', body, schema: z.object({ mediaId: z.uuid() }) })
}
