import type { ClientDestination, ClientStay } from '../model/client-home'

// Legacy header state no longer loads demonstration listings.
export async function fetchClientStays(signal?: AbortSignal): Promise<ClientStay[]> { signal?.throwIfAborted(); return [] }
export async function fetchClientDestinations(signal?: AbortSignal): Promise<ClientDestination[]> { signal?.throwIfAborted(); return [] }
