import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function fakeJwt(sub: string, jti: string) {
  const encode = (obj: Record<string, string>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub, jti })}.sig`
}

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  readonly name: string

  constructor(name: string) {
    this.name = name
    FakeBroadcastChannel.instances.push(this)
  }

  postMessage(data: unknown) {
    for (const peer of FakeBroadcastChannel.instances) {
      if (peer !== this && peer.name === this.name) {
        peer.onmessage?.({ data } as MessageEvent)
      }
    }
  }

  close() {
    FakeBroadcastChannel.instances = FakeBroadcastChannel.instances.filter(item => item !== this)
  }
}

beforeEach(() => {
  vi.resetModules()
  FakeBroadcastChannel.instances = []
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel)
  vi.stubGlobal('window', { BroadcastChannel: FakeBroadcastChannel })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cross-tab session broadcast identity cache isolation', () => {
  it('cancels in-flight queries and clears query cache when another tab switches to a different user', async () => {
    await import('./session-manager')
    const { getSession, setSession } = await import('@/shared/api/session')
    const { queryClient } = await import('@/shared/lib/query-client')

    const userASession = {
      accessToken: fakeJwt('user-a', 'jti-1'),
      expiresAt: '2030-01-01T00:00:00Z',
      userId: 'user-a',
    }
    const userBSession = {
      accessToken: fakeJwt('user-b', 'jti-2'),
      expiresAt: '2030-01-01T01:00:00Z',
      userId: 'user-b',
    }

    setSession(userASession)
    queryClient.setQueryData(['bookings', 'list', 'mine', 'user-a', 'trips', ['CONFIRMED']], { guestName: 'Khách A' })
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')

    const otherTab = new FakeBroadcastChannel('stayhub_auth_channel')
    otherTab.postMessage({ type: 'SESSION_UPDATED', session: userBSession })

    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData(['bookings', 'list', 'mine', 'user-a', 'trips', ['CONFIRMED']])).toBeUndefined()
    expect(getSession()).toEqual(userBSession)
  })

  it('detects identity switch via JWT sub even when userId is omitted on the broadcast session', async () => {
    await import('./session-manager')
    const { getSession, setSession } = await import('@/shared/api/session')
    const { queryClient } = await import('@/shared/lib/query-client')

    setSession({ accessToken: fakeJwt('user-a', 'jti-1'), expiresAt: '2030-01-01T00:00:00Z' })
    queryClient.setQueryData(['complaints', 'mine', 'user-a'], [{ id: 'c1' }])

    const otherTab = new FakeBroadcastChannel('stayhub_auth_channel')
    otherTab.postMessage({
      type: 'SESSION_UPDATED',
      session: { accessToken: fakeJwt('user-b', 'jti-2'), expiresAt: '2030-01-01T01:00:00Z' },
    })

    expect(queryClient.getQueryData(['complaints', 'mine', 'user-a'])).toBeUndefined()
    expect(getSession()?.accessToken).toContain(fakeJwt('user-b', 'jti-2'))
  })

  it('retains cached query data when another tab refreshes a token for the same user identity', async () => {
    await import('./session-manager')
    const { getSession, setSession } = await import('@/shared/api/session')
    const { queryClient } = await import('@/shared/lib/query-client')

    const initialToken = fakeJwt('user-a', 'jti-1')
    const refreshedToken = fakeJwt('user-a', 'jti-2')

    setSession({ accessToken: initialToken, expiresAt: '2030-01-01T00:00:00Z', userId: 'user-a' })
    queryClient.setQueryData(['bookings', 'list', 'mine', 'user-a'], [{ id: 'b1' }])
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')

    const otherTab = new FakeBroadcastChannel('stayhub_auth_channel')
    otherTab.postMessage({
      type: 'SESSION_UPDATED',
      session: { accessToken: refreshedToken, expiresAt: '2030-01-01T01:00:00Z', userId: 'user-a' },
    })

    expect(cancelSpy).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(['bookings', 'list', 'mine', 'user-a'])).toEqual([{ id: 'b1' }])
    expect(getSession()?.accessToken).toBe(refreshedToken)
  })

  it('cancels in-flight queries and clears cache when another tab broadcasts LOGOUT', async () => {
    await import('./session-manager')
    const { getAuthStatus, getSession, setSession } = await import('@/shared/api/session')
    const { queryClient } = await import('@/shared/lib/query-client')

    setSession({ accessToken: fakeJwt('user-a', 'jti-1'), expiresAt: '2030-01-01T00:00:00Z', userId: 'user-a' })
    queryClient.setQueryData(['bookings', 'list', 'mine', 'user-a'], [{ id: 'b1' }])
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')

    const otherTab = new FakeBroadcastChannel('stayhub_auth_channel')
    otherTab.postMessage({ type: 'LOGOUT' })

    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData(['bookings', 'list', 'mine', 'user-a'])).toBeUndefined()
    expect(getSession()).toBeNull()
    expect(getAuthStatus()).toBe('unauthenticated')
  })
})
