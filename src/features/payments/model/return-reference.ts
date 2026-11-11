import { z } from 'zod'

// The redirect identifies a payment; only the authenticated backend decides its result.
export function returnReference(params: URLSearchParams): string | null {
  const references = params.getAll('vnp_TxnRef')
  if (references.length !== 1) return null
  const parsed = z.uuid().safeParse(references[0])
  return parsed.success ? parsed.data : null
}
