import { describe, expect, it, vi } from 'vitest'
import { readAuthLinkToken } from './auth-link-token'
import { stripAuthLinkTokenFromLocation } from '../hooks/use-auth-link-token'

describe('readAuthLinkToken', () => {
  it('reads a token from the URL fragment and strips it cleanly', () => {
    expect(readAuthLinkToken('https://example.test/verify-email#token=frag-secret-123')).toEqual({
      token: 'frag-secret-123',
      cleanPath: '/verify-email',
    })
  })

  it('preserves other query params and other fragment params when stripping fragment token', () => {
    expect(
      readAuthLinkToken('https://example.test/reset-password?next=account#token=a%2Bb&section=form'),
    ).toEqual({
      token: 'a+b',
      cleanPath: '/reset-password?next=account#section=form',
    })
  })

  it('falls back to legacy query token while preserving other query params and plain hash anchor', () => {
    expect(
      readAuthLinkToken('https://example.test/reset-password?token=legacy%2Btok&next=account#form'),
    ).toEqual({
      token: 'legacy+tok',
      cleanPath: '/reset-password?next=account#form',
    })
  })

  it('prefers fragment token over legacy query token and strips token from both', () => {
    expect(
      readAuthLinkToken('https://example.test/verify-email?token=query-tok&next=home#token=frag-tok&step=1'),
    ).toEqual({
      token: 'frag-tok',
      cleanPath: '/verify-email?next=home#step=1',
    })
  })

  it('falls back to query token when fragment token is empty and still strips both', () => {
    expect(
      readAuthLinkToken('https://example.test/verify-email?token=query-tok#token='),
    ).toEqual({
      token: 'query-tok',
      cleanPath: '/verify-email',
    })
  })

  it('returns empty token and leaves URL unchanged when no token is present', () => {
    expect(readAuthLinkToken('https://example.test/login?next=home#form')).toEqual({
      token: '',
      cleanPath: '/login?next=home#form',
    })
  })
})

describe('stripAuthLinkTokenFromLocation', () => {
  it('strips fragment and query tokens via history.replaceState while keeping state and other params', () => {
    const replaceState = vi.fn()
    const state = { idx: 2 }

    stripAuthLinkTokenFromLocation(
      { href: 'https://example.test/verify-email?next=home#token=secret-123' },
      { state, replaceState },
    )
    expect(replaceState).toHaveBeenCalledWith(state, '', '/verify-email?next=home')

    replaceState.mockReset()
    stripAuthLinkTokenFromLocation(
      { href: 'https://example.test/reset-password?token=legacy&next=home#token=frag&tab=1' },
      { state, replaceState },
    )
    expect(replaceState).toHaveBeenCalledWith(state, '', '/reset-password?next=home#tab=1')
  })

  it('does not call history.replaceState when URL has no token', () => {
    const replaceState = vi.fn()
    stripAuthLinkTokenFromLocation(
      { href: 'https://example.test/login?next=home#form' },
      { state: null, replaceState },
    )
    expect(replaceState).not.toHaveBeenCalled()
  })
})
