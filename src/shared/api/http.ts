import { env } from '@/shared/config/env'
import { createHttpClient } from './client'

export const http = createHttpClient({
  baseUrl: env.apiBaseUrl,
  timeoutMs: env.apiTimeoutMs,
})
