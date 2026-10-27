import { http } from '@/shared/api/http'
import { healthSchema } from '../types/health'

export function getBackendHealth(signal?: AbortSignal) {
  return http.requestRaw('/actuator/health', { signal, schema: healthSchema })
}
